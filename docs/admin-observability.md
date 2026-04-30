# Admin & Observability Plan

What to build in-app vs what to buy. Recommendation is a **hybrid stack**: Paddle + off-the-shelf tools for analytics, minimal `/admin` page in-app for day-to-day support ops.

## What Paddle already covers (don't rebuild)

- MRR, ARR, subscription counts by plan
- Churn rate (involuntary + voluntary), dunning status
- Revenue by region / currency
- Transaction history, refunds, adjustments
- Customer list with subscription status
- Failed payment retry status
- Webhook delivery logs

Accessible at the Paddle dashboard — zero build, already paid for.

## What Paddle does NOT cover (you must build or buy)

These are the ones that actually determine how the business is running:

- **Gens per user** — usage, not billing
- **Credit balance / consumption patterns**
- **Expand vs Upscale feature split**
- **Storage / bandwidth per user**
- **Abuse signals** — fingerprint dupes, rate-limit hits, velocity alerts
- **Gemini spend reconciliation** — GCP bill vs revenue
- **Funnel conversion** — signup → first-gen → paid
- **Cohort retention**
- **P50/P90/P99 latency**

## Recommended stack

| Layer | Tool | Cost | What it does |
| --- | --- | --- | --- |
| Payments dashboard | Paddle | $0 | Subs, MRR, churn, refunds |
| Error tracking | **Sentry Team** | $26/mo | Exceptions, alerts, release tracking |
| Product analytics | **PostHog Cloud** | Free ≤1M events, $0.000248/event after | Funnels, feature usage, session replay, A/B tests |
| Deep analytics / BI | **Metabase self-hosted** | ~$5/mo (Fly.io small VM) | SQL dashboards on Supabase directly |
| Traffic / perf | Vercel Analytics | Free on Pro | Page views, web vitals, geo distribution |
| Uptime | **BetterStack** | $0-18/mo | Uptime, response time, incident mgmt |
| Log drain | **Axiom** free tier | Free ≤500 GB/mo | Search logs past Vercel's 7-day cap |
| AI spend | Google Cloud Billing | Free | Gemini cost tracking + budget alerts |
| In-app admin | Next.js `/admin` | Dev time | Operational ops only |

Total monthly observability cost: **~$50-75/mo** at launch scale. Every tool here is industry-standard; no snowflakes, so replaceable.

## What to build in-app at `/admin`

Build only what requires real-time write access to your own database. Everything else → Metabase/PostHog.

### /admin/users — User lookup & operations

- Search by email
- Display: signup date, tier, credit balance, Paddle customer ID, recent login, # of gens in last 30 days, last gen timestamp, storage footprint
- Actions:
  - **Grant credits** (manual, for support/refund) — writes to `credits` ledger with reason code
  - **Flag for fair-use review** — sets `profiles.fair_use_flagged = true`, future gens throttled
  - **Force resync credits** — calls `syncCreditsForUser()` manually
  - **View Paddle subscription** — link out, don't duplicate
- Implementation: simple Next.js page guarded by a Supabase RLS policy checking `profiles.role = 'admin'`

### /admin/abuse — Abuse monitor

- Table of: fingerprint hash | IP | account count | first seen | last seen | total gens
- Sorted by account count desc — surfaces fingerprint dupes (same device, multiple free signups)
- Filter: "show only free tier" (paying users aren't abuse)
- Action: "Ban fingerprint" — future signups with same fingerprint get 0 free credits

### /admin/storage — Retention sanity check

- Table: user email | storage used (MB) | item count | oldest item age
- Sorted by storage desc
- Alert row: any user > 600 MB or > 100 items (your retention cron is broken)
- Action: "Force purge" — runs retention sweep for that user now

### /admin/system — Health glance

- Gemini API: last 100 calls success rate, avg latency
- Supabase storage: total GB used vs free tier cap
- Vercel bandwidth: this-month usage vs cap
- Recent errors count (link to Sentry)
- Last cron run timestamps

### What NOT to build in `/admin`

- MRR charts → Paddle
- Funnels → PostHog
- Cohort retention curves → Metabase SQL
- Revenue attribution → Paddle + Metabase
- Error details → Sentry

If you catch yourself building a chart in `/admin`, stop and ask: could this be a Metabase SQL dashboard instead? 95% of the time, yes.

## Metabase dashboards (week 1 after launch)

Metabase reads from your Supabase Postgres directly. Dashboards are SQL + visual config; each one is 10-30 min of work.

### Dashboard 1 — Revenue

Data source: Paddle webhook events persisted to `transactions` + `subscriptions` tables.

- MRR trend (line, monthly)
- MRR by tier (stacked area)
- New MRR vs churned MRR (bars, weekly)
- Annual vs monthly subscriber split (pie)
- ARPU by tier (numbers)

### Dashboard 2 — Usage

Source: `create_generations` table.

- Gens/day rolling (line, 90 days)
- Gens per user distribution (histogram, per tier)
- P50/P90/P99 gens per user per tier (numbers)
- Expand vs Upscale split (pie, distinguishable via the `target_ratio` prefix: `upscale-*` vs ratio like `9:16`)
- Batch size distribution
- Active users (≥1 gen in last 7 days) by tier

### Dashboard 3 — Conversion funnel

- Landing page → signup (from PostHog — don't duplicate)
- Signup → email verified (SQL on `auth.users.email_confirmed_at`)
- Email verified → first gen (join `profiles` + `create_generations`)
- First gen → paid (join `profiles` + `subscriptions`)
- Paid → churned at 30/60/90 days (cohort by signup month)

### Dashboard 4 — Cost reconciliation (the one you'll look at weekly)

- Total gens this month
- Estimated Gemini cost (gens × $0.135 base + 4K adjustment)
- Actual Gemini cost from GCP Billing CSV upload (manual weekly)
- Variance (should be ≤ 5%)
- $/gen trend — catches Gemini pricing changes early
- Revenue vs AI cost ratio (target: revenue ≥ 3× AI cost)

### Dashboard 5 — Abuse

- Free accounts per IP /24 subnet (histogram, last 7 days)
- Fingerprint dupes (count per hash, last 30 days)
- Rate-limit hits per hour (line)
- New-signup velocity by hour
- Email domains of free signups (top 20)

### Dashboard 6 — Storage / bandwidth

- Cumulative storage GB over time (should stay flat given 24h retention)
- Active items per user histogram (should peak < 50, tail to 100)
- Supabase egress trend vs 250 GB free tier
- Vercel bandwidth trend vs 1 TB free tier
- Days until free-tier overage at current rate

### Dashboard 7 — Platform health

- Gemini success rate (last 24h)
- Avg generation latency P50/P95
- Webhook success rate
- Error count (link to Sentry)
- Uptime % (link to BetterStack)

## PostHog setup

Install `posthog-js` in `app/layout.tsx`. Track these events:

- `page_view` (auto)
- `signup_started` / `signup_completed`
- `email_verified`
- `first_gen_attempted` / `first_gen_completed`
- `gen_started` (with tool: expand|upscale, tier, target)
- `paywall_viewed` (why: out_of_credits, upscale_locked)
- `upgrade_clicked` (from_tier, to_tier)
- `subscription_started` / `subscription_canceled`
- `rate_limit_hit`

PostHog builds funnels automatically from these. Session replay is huge for this — watching a real user hit the paywall tells you more than any dashboard.

## Alerts (Day 1 Slack channel; phone for the 3 critical ones)

| Alert | Threshold | Channel |
| --- | --- | --- |
| Gemini error rate | > 2% in 5 min | Phone |
| Webhook signature failure | any | Phone |
| AI daily spend vs 7-day avg | > 2× | Phone |
| Error rate | > 1% | Slack |
| Signup velocity | > 5× trailing hour | Slack |
| Rate-limit hits | > 50 / hour | Slack |
| Any user exceeds 200 gens / 24h | once per user | Slack |
| Supabase storage > 80% free tier | daily check | Slack |
| Uptime drop | < 99% for 5 min | Slack |

All achievable via Sentry alerts + BetterStack + a weekly Metabase email for the non-critical metrics.

## Implementation priority

### Week 0 (before public launch)
- Paddle dashboard configured
- Sentry installed + source maps uploaded
- BetterStack monitoring live
- Basic `/admin/users` page for manual support ops

### Week 1 (launch week)
- PostHog installed + core events tracked
- Metabase deployed on Fly.io, connected to Supabase
- Dashboard 1 (Revenue) + Dashboard 2 (Usage) live
- Slack alerts wired for critical paths

### Week 2-4
- Dashboards 3-7 added
- Cost reconciliation routine weekly
- `/admin/abuse` + `/admin/storage` pages

### Month 2+
- PostHog session replay enabled
- Experiments (A/B pricing, landing copy)
- Automated weekly email report to founder

## One thing to avoid

Don't build a "unified admin dashboard" that tries to show everything in one place. Every SaaS founder does this, and they all regret it. Each tool (Paddle, Metabase, PostHog, Sentry) has its own best surface — linking out from `/admin` beats embedding.
