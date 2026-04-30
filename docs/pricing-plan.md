# Pricing & Subscription Plan

Planning doc for moving from the sandbox credit-pack model to a production subscription model with a free trial. Nothing in this doc is implemented yet — this is the blueprint to review before we build.

## 1. Unit economics (the number that drives everything)

### Cost per generation today

Current model: `gemini-3-pro-image-preview` — this is **"Nano Banana Pro"**, the premium Gemini 3 image model. Not to be confused with:
- "Nano Banana" (v1/v2) = Gemini 2.5 Flash Image, ~$0.03-0.04/image
- "Nano Banana Pro" = Gemini 3 Pro Image Preview, **much more expensive**

Official pricing (Google AI pricing page, April 2026):

| Line item | $/gen |
| --- | --- |
| Input image read | $0.0011 |
| **Output at 1K-2K (1024-2048px)** | **$0.134** |
| **Output at 4K (4096px)** | **$0.24** |
| Batch API discount | 50% off — but batch is async, can't use for interactive UX |
| Vercel Pro streaming route | ~$0.0001 per invocation |
| Supabase storage (source + result ~ 3 MB) | ~$0.00006/gen amortized |

**Fully-loaded cost for planning:**
- Standard gen (1K-2K output): **$0.135/gen**
- 4K gen: **$0.24/gen**

This is 3× what I estimated in the v1 of this doc. It completely changes the tier math — see section 2.

> Verify these numbers against the actual Google Cloud billing export before launch. Preview models change pricing.

### Target contribution margin

At $0.135/gen our **break-even per gen is the plan price ÷ included gens**. For a 70% gross margin, plan price must be ≥ **$0.45 per included gen**.

That reality check kills aggressive tier design. You either:
1. Charge premium prices ($19+ entry) and keep gen counts moderate, OR
2. Use a cheaper model (swap Pro → Flash where quality allows), OR
3. Both — Flash for the cheap tiers, Pro as a premium add-on.

### Full per-generation cost model (every line item)

All numbers in USD. Assumes Gemini 3 Pro Image at 1K-2K output ($0.134). Source + result images average 3 MB each (compressed JPEG in storage; PNG at ~3 MB after our pre-upload compression step in `utils/compress-image.ts`).

**Retention policy (locks these costs tight):**
- Hard cap **24-hour TTL** on every history item
- **Max 100 items per user**; when exceeded, FIFO delete oldest
- Implementation: scheduled Supabase cron on `create_generations` table + storage cleanup every 15 min

This policy is the single biggest cost lever. Without it, storage grows unbounded. With it, per-user storage has a hard ceiling of `min(100 × 6MB, 24h-volume × 6MB) = 600 MB worst case`.

**Data movement per single generation (steady state):**

| # | Step | Bandwidth | Cost bucket |
| --- | --- | --- | --- |
| 1 | User → Vercel (upload source) | ~3 MB | Vercel ingress (free) |
| 2 | Vercel → Gemini API | ~3 MB | Vercel egress (counts) |
| 3 | Gemini → Vercel (result) | ~3 MB | Vercel ingress (free) |
| 4 | Vercel → Supabase Storage (write source + result) | ~6 MB | Supabase ingress (free) |
| 5 | Vercel → User (SSE with base64 result) | ~4 MB | Vercel egress (counts) |
| 6 | Later history views (assume avg 2 views × 6 MB) | ~12 MB Supabase egress + ~12 MB Vercel egress | Both count |
| 7 | Download (avg 1) | ~6 MB Supabase egress + ~6 MB Vercel egress | Both count |

**Per-gen totals:**
- Vercel egress: **~25 MB**
- Supabase egress: **~18 MB**
- Supabase storage held 24h = 6 MB × (1/30) = **0.2 MB-month**
- Gemini API: **$0.134** (or $0.24 at 4K)

**Cost per gen at line-item level:**

| Line item | Unit price | Per gen |
| --- | --- | --- |
| Gemini 3 Pro 1K-2K | $0.134/image | **$0.13400** |
| Vercel egress ($0.15/GB after 1 TB free) | $0.00000015/MB | $0.00000375 |
| Supabase egress ($0.09/GB after 250 GB free) | $0.00000009/MB | $0.00000162 |
| Supabase storage ($0.021/GB/mo after 100 GB free) | $0.021/GB/mo | $0.0000000044 (negligible) |
| Vercel function duration (~15s × $0.00001/s Pro) | — | $0.00015 |
| **Total marginal per gen** | | **~$0.1354** |

**So Gemini is 99% of marginal cost.** Storage and bandwidth round to nothing on a per-gen basis — they only matter at scale (free-tier overage).

### Cost at realistic scale

The retention policy makes the math actually tractable. Here are three scales using a **50/40/10 split across Starter/Creator/Pro** with realistic usage (30-40% of tier cap, per typical SaaS power-law curves):

**100 paying users:**

| | Users | Avg gens/mo | Total gens | Revenue |
| --- | --- | --- | --- | --- |
| Starter ($19) | 50 | 35 | 1,750 | $950 |
| Creator ($49) | 40 | 100 | 4,000 | $1,960 |
| Pro ($99) | 10 | 400 | 4,000 | $990 |
| **Totals** | **100** | | **9,750** | **$3,900** |

Costs:
- Gemini: 9,750 × $0.135 = **$1,316**
- Supabase storage steady-state: ~1.8 GB (well within 100 GB free) → **$0**
- Supabase egress: 9,750 × 18 MB = 175 GB (within 250 GB free) → **$0**
- Vercel bandwidth: 9,750 × 25 MB = 244 GB (within 1 TB free) → **$0**
- Fixed baseline (Supabase Pro $35, Vercel Pro $20, Sentry $26, Termly $15, domain $2): **$98**
- **Total: $1,414**
- **Gross profit: $2,486 → 64% margin** ✓

**1,000 paying users:**

| | Users | Avg gens/mo | Total gens | Revenue |
| --- | --- | --- | --- | --- |
| Starter ($19) | 500 | 35 | 17,500 | $9,500 |
| Creator ($49) | 400 | 100 | 40,000 | $19,600 |
| Pro ($99) | 100 | 400 | 40,000 | $9,900 |
| **Totals** | **1,000** | | **97,500** | **$39,000** |

Costs:
- Gemini: 97,500 × $0.135 = **$13,162**
- Supabase storage steady-state: ~18 GB (within 100 GB free) → **$0**
- Supabase egress: 97,500 × 18 MB = 1,755 GB. Minus 250 GB free = 1,505 GB × $0.09 = **$135**
- Vercel bandwidth: 97,500 × 25 MB = 2,437 GB. Minus 1 TB free = 1,413 GB × $0.15 = **$212**
- Fixed baseline: **$98**
- **Total: $13,607**
- **Gross profit: $25,393 → 65% margin** ✓

**10,000 paying users:**

| Item | Value |
| --- | --- |
| Gens/mo | 975,000 |
| Revenue | $390,000 |
| Gemini cost | $131,625 |
| Supabase storage (180 GB steady) | 80 GB × $0.021 = $1.68 |
| Supabase egress (17.5 TB) | 17,250 GB × $0.09 = $1,553 |
| Vercel bandwidth (24.4 TB) | 23,400 GB × $0.15 = $3,510 |
| Supabase Pro tier may need upgrade to Team ($599/mo) | +$564 |
| Fixed baseline | $98 |
| **Total** | **~$137,350** |
| **Gross profit** | **$252,650 → 65% margin** ✓ |

The 65% margin is stable across scale because Gemini dominates cost and has flat per-unit pricing.

### Storage abuse scenarios — does retention policy hold?

**Scenario A:** User generates 1,000 images in a single day.
- FIFO cap kicks in at 100. Oldest get deleted as new ones arrive.
- Storage footprint: 100 × 6 MB = **600 MB peak** for that user
- After 24h from the last gen, footprint → 0
- AI cost: 1,000 × $0.135 = $135 to us. Revenue from that user at $99 Pro = $99 → **we lose $36**
- **This is why the fair-use cap at 1,500/mo exists** — a single user burning $135/day would exceed Pro's $99 monthly revenue in one day if unchecked.

**Scenario B:** 10,000 users each sit at max 100 items.
- Worst-case storage: 10,000 × 100 × 6 MB = **6 TB**
- Supabase cost: 6,000 GB - 100 GB free = 5,900 × $0.021 = **$124/mo**
- This is the maximum your retention policy ever lets storage hit. Even at this cap it's a rounding error vs Gemini spend.

**Scenario C:** Someone script-floods a free account to burn your Gemini budget.
- Hard rate limit 20/5min + 200/day + free tier only gets 5 gens total → blocks at $0.68 of AI spend per attacker
- Turnstile captcha + IP/fingerprint dedup prevents mass account creation
- Worst case: attacker manually creates 100 accounts, each burns 5 free gens = 500 gens × $0.135 = **$68** loss
- **Mitigation:** email verification required before free credits activate (one extra click, kills 90% of bots)

### What the retention policy does NOT protect against

- **In-session cost** — a user mid-generation still triggers a full $0.135 Gemini call regardless of history policy. Rate limiting is the only defense here.
- **Download-hoarding** — a user who downloads every gen before it's purged keeps their own copy forever, but that's a user-side concern; doesn't affect our bill.
- **History views of already-deleted items** — UI must gracefully handle "this generation has expired" so users aren't confused by 404s. Add this to the history page: items ≥ 24h old show an empty placeholder card with "Expired — re-generate to recreate" CTA.

### Competitive reference points (April 2026)

These are rough market anchors — verify on each site before quoting.

| Product | Entry paid plan | Generations / mo | Effective $ / gen | Model cost |
| --- | --- | --- | --- | --- |
| Higgsfield Plus | $34 / mo | 1,000 credits + "unlimited" on cheap models | ~$0.034 headline | Runs mostly on Flash-tier models |
| Higgsfield Ultra | $84 / mo | 3,000 credits (→9,000 scale) + "unlimited" on cheap | ~$0.028 headline | Same — premium models cost extra |
| Magnific AI | $39 / mo (Pro) | ~3,000 upscales | ~$0.013 | Runs Real-ESRGAN derivative, pennies to run |
| Topaz Photo AI | $199 one-time (perpetual) | Unlimited local | N/A | Runs on user's GPU |
| Clipdrop | $9 / mo | 1,500 | ~$0.006 | Stability open models |
| Canva Magic Expand | Bundled w/ Canva Pro $15 | Soft-capped | Bundled | In-house |
| Runway Gen-3 image | $15 / mo | ~625 credits (image = 5) | ~$0.12 | Own model, expensive |

Takeaway: **every competitor running cheap models can undercut us** if we stay on Gemini 3 Pro. The strategic question is whether our quality + expand/upscale combo justifies a $19+ entry plan, or whether we swap Pro for Flash on the lower tiers to hit a $9 shelf.

## 2. Proposed tiers (v2 — no top-ups, unlimited top tier)

Rebuilt given the real $0.135/gen cost and the new direction: **no credit top-ups, unlimited top tier like Higgsfield**.

All tiers priced in USD, both monthly and annual (20% annual discount, same rail as existing `pricing-tier.ts`).

### Free Trial (no credit card)

- **5 generations** on signup (~$0.68 AI spend — the cost of customer acquisition)
- **One-shot grant, no monthly reset** — so we don't get farmed
- Restrictions: 1 image at a time (no batch), watermarked download, 1K output, Expand only (not Upscale — upscale is a paid hook)
- Abuse controls: IP + device fingerprint + disposable email block + Turnstile captcha (see section 3)

### Starter — $14 / mo ($134 / yr)

Lowered from $19 per competitor analysis — $9-$15 is the psychological shelf for single-purpose image tools (Clipdrop $9, Let's Enhance $12, Canva Pro $15). $19 was ceding the side-by-side comparison test.

- **100 generations / month**
- At **avg user usage (30 gens/mo)**: $4.05 cost vs $14 price → **71% margin**
- At **cap (100 gens)**: $13.50 cost vs $14 price → **3% margin** (breakeven, rare)
- Expand + Upscale, both tools unlocked
- 2K output max
- No watermark
- Batch up to 3 at a time
- History: 24h rolling, max 100 items (per retention policy)

### Creator — $29 / mo ($278 / yr) — **Featured**

Lowered from $49 — the $29 price point (just below $30) is proven to convert dramatically better in SaaS. Same-tier comparable: Let's Enhance Pro at $34.

- **300 generations / month**
- At **avg user usage (90 gens/mo)**: $12.15 cost vs $29 price → **58% margin**
- At **cap (300 gens)**: $40.50 cost vs $29 price → **-40% margin** (cap-user loses us money, but < 10% of Creator users hit cap in a typical SaaS distribution)
- Cohort margin at realistic distribution: ~55%
- Everything in Starter
- 4K output available (costs us $0.24/gen — assume ~15% of Creator users take advantage)
- Priority queue (separate rate-limit bucket server-side)
- Unlimited batch size
- History: 24h rolling, max 100 items

### Pro — $79 / mo ($758 / yr) — **"Unlimited"**

Lowered from $99 — under-$100 psychological wall matters for conversion. $79 reads as "serious but reasonable"; $99 reads as "expensive tool I need to justify."

- **Unlimited generations** with a silent **1,000/mo fair-use cap** (tightened from 1,500 because of lower price)
- P90 of serious creator tools is 400-700/mo — 1,000 buffers 95% of legitimate use
- At **avg Pro user (350 gens/mo)**: $47 cost vs $79 price → **40% margin**
- At **fair-use cap (1,000 gens)**: $135 cost vs $79 price → **-71% margin** — heaviest 5% of subscribers lose us money individually, but cohort still profitable at ~40% margin because most Pro users are in the 200-500 range.
- At **true scripted abuse (no cap, 5,000 gens)**: $675 loss. Why the fair-use cap + rate limits exist.
- Everything in Creator
- API access (bring-your-own-key for Gemini, with your auth) — eliminates AI cost on API usage
- Dedicated support (48 h SLA)
- Team seats: 3 included, +$15/seat after
- History: 24h rolling, max 100 items (same as other tiers — heavy users tend to export/download rather than rely on history)

### No top-ups

Removed from this version of the plan. Rationale:
- Top-ups imply "you can run out" which contradicts the Unlimited positioning at the top tier
- Creator → Pro upgrade is the natural path when Creator users hit their cap — top-ups cannibalize that upgrade
- Simpler pricing = higher conversion

If a Creator user hits 300/mo and still wants more, the paywall copy says: **"Upgrade to Pro — no limits, same card on file."** One-click upgrade via Paddle subscription change.

### How we enforce "unlimited" without getting destroyed

Three layers, all server-side in `/api/image-*/stream/route.ts`:

1. **Hard rate limit per user:** 20 gens / 5 min rolling window, 200 / day — blocks accidental infinite-loop scripts
2. **Soft fair-use cap:** 1,500 / 30-day rolling on Pro. At 1,400 send an email "heads up, fair use cap approaching"; at 1,500 queue remaining requests to 60-sec cooldown each (still processes, just slows down). Almost nobody hits this.
3. **Anomaly alerting:** if a single user does > 3× P95 volume in a week, page us. Real creators who need that volume → offer custom Business plan at $299/mo.

This is the pattern Higgsfield, Midjourney, ChatGPT Plus, and Cursor all use. Users perceive "unlimited," we keep margins.

## 3. Free-trial abuse prevention (deeper)

No credit card means we need layered defenses. None of these should live in client code.

| Layer | Mechanism | Where it lives |
| --- | --- | --- |
| Email domain | Reject disposable domains at signup | `signup/actions.ts` server action |
| IP fingerprint | Hash IP + user-agent on first grant, store on `profiles` | Supabase row + server-side check in `syncCreditsForUser` |
| Device fingerprint | Use `@fingerprintjs/fingerprintjs` (open-source), store hash | Middleware or signup action |
| Rate limit | Upstash or Supabase-native `pg_net` + count query | `/api/image-upscaler/stream` guard |
| Captcha on signup | Cloudflare Turnstile (free), only shown after Nth signup from same /24 | `signup/page.tsx` |
| Honeypot field | Hidden form field; bots fill it | All public forms |
| Payment-on-upgrade | First paid action forces real card via Paddle; Paddle blocks stolen cards | Existing checkout flow |

Key principle: **don't block signups, just gate the free credits.** A user with a blocked fingerprint can still create an account and upgrade — they just don't get free credits.

## 4. Paddle configuration checklist

When we move from sandbox to prod:

- [ ] Recreate all products in production Paddle dashboard (price IDs will differ)
- [ ] Update `constants/pricing-tier.ts` with production price IDs OR move IDs to env vars (cleaner — recommended)
- [ ] Create annual prices for every monthly price
- [ ] Set tax mode = "inclusive" for EU / include-VAT markets — Paddle handles this
- [ ] Configure webhook for `subscription.created`, `subscription.updated`, `subscription.canceled`, `transaction.completed`, `adjustment.created`
- [ ] Set up grace period (3 days) for dunning on failed renewals
- [ ] Turn on localized pricing for at least: USD, EUR, GBP, CAD, AUD, INR, BRL

## 5. In-app surfacing

- Home page pricing table: 3 cards + "Start free, no card" CTA above
- Dashboard header: persistent credits badge with "Upgrade" button when < 10 credits
- On zero credits: inline paywall modal on the workbench, not a redirect (don't kill the session)
- Annual toggle: single switch above the 3 cards, show "Save 20%" chip

## 6. Metrics to wire up before launch

Without these, we can't tune pricing:

- Signup → first-gen conversion rate
- First-gen → paid conversion rate (goal: 2–4% for freemium utilities)
- Average gens per paid user per month (identifies tier misalignment)
- Margin per plan (recomputed weekly from actual Gemini bill)
- Refund rate and reason tagging in Paddle

PostHog or Vercel Analytics + a lightweight `events` table in Supabase is enough.

## 7. Open questions for the product call

1. Do we want to keep the existing $CreditGrantByTierId numbers (50 / 250 / 1000) or switch to the new (150 / 500 / 2000)? Recommendation: new numbers, clearer tier jumps.
2. Welcome grant (`WelcomeCreditGrant = 20`) is currently given to everyone — shrink to 5 for the new free tier so paid plans feel substantially better.
3. Do we want a "lite" annual-only tier ($5.99/mo billed annually, 50 gens) to hit the sub-$10 shelf that casual users search for? Worth testing.
4. Whose card pays for AI spend during a promo? If we discount 50% off for 3 months, we eat the margin — model it first.

## 8. Roll-out order

1. Ship free-trial + abuse controls (can go live without touching Paddle prices)
2. Ship new tier copy + price IDs behind a feature flag
3. Grandfather existing paying users on old pricing for 6 months (standard practice)
4. Kill sandbox prices only after the migration cohort is 100% on new plans
