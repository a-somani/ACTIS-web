# Go-Live Checklist

Single source of truth for taking AeroEdit from sandbox to production. Walk top-to-bottom; nothing below a section is safe to start until the things above it are done.

> **Rule of thumb:** every env var that has `sandbox`, `test`, `localhost`, or a personal email in it needs to be re-set for production. Do not copy the sandbox `.env` to Vercel and "fix it later."

## 0. Legal prerequisites (start these first — they take the longest)

### Business entity

If you're not already incorporated, you need an entity **before** KYB. Options:

- US LLC (Stripe Atlas, Firstbase, or local filing) — ~$300-500, ~1-2 weeks
- UK Ltd — ~£12 via Companies House, same day
- Delaware C-Corp — needed if you're raising VC, otherwise overkill

You also need:

- EIN (US) or company number (UK) — required by Paddle
- Business bank account — required for payouts
- A company address that matches incorporation docs (PO boxes usually rejected)

### Account Verification — Paddle's three phases

Paddle is **Merchant of Record** — they resell on your behalf, collect tax, and pay you out. Before switching you from sandbox to live, they run **three parallel verification phases**:

1. **Domain Review** — checks your live website ([docs](https://www.paddle.com/help/start/account-verification/what-is-domain-verification))
2. **Business Identification** — what most people call "KYB" ([docs](https://www.paddle.com/help/start/account-verification/what-is-business-verification))
3. **Identity Verification** — KYC for the account holder + UBOs ([docs](https://www.paddle.com/help/start/account-verification/what-is-identity-verification))

#### Phase 1 — Domain Review

Paddle reviews the public site at the domain you'll use for checkout. Required:

- **Live HTTPS site** (SSL valid; not localhost; not Vercel preview URL)
- **Terms & Conditions** — must include the company legal name (or sole-proprietor brand)
- **Privacy Policy**
- **Refund Policy**
- All three legal pages **clearly accessible via navigation/footer** (no buried URLs)
- **Contact page with email AND phone number** (Paddle explicitly requires phone — missing this is a common rejection)
- **Clear product explanation** — if your description uses niche language, be ready to clarify to Paddle

**Timeline:** automated checks pass instantly; manual review **5-7 business days**.

#### Phase 2 — Business Identification

For the business entity:

1. **Business registration document** — government-issued: legal name, registration number, address, ownership structure. Examples: Certificate of Incorporation (US), Companies House extract (UK), state-issued LLC formation docs.
2. **Shareholder / ownership breakdown** — names + percentages, identifying every owner with **> 25% ownership**. (Skipped if you're a sole trader.)
3. **Proof of business address** — utility bill, bank statement, or lease, **dated within last 3 months**, matching the registered address.
4. **Tax form** — W-9 (US entity) or W-8BEN-E (non-US entity) via Paddle's fillable forms.
5. **Bank/payout details** (covered separately in Phase 4 below — needed for go-live, not strictly verification).

#### Phase 3 — Identity Verification

For the account holder + every UBO ≥ 25%:

- Personal details (name, DOB, nationality, residential address)
- **Photo of government ID** (passport preferred globally; driver's license in some jurisdictions)
- **Video selfie** (live capture, not a photo upload)
- Proof of personal address < 3 months old, matching the ID address

**Timeline:** typically **instant** (automated); manual review **1-3 business days** if flagged.

#### Total expected timeline

If everything is clean on first submission: **5-10 business days** total. If anything bounces back for clarification: **2-3 weeks**. Plan for the slower path.

**Process:**

- Apply inside the Paddle dashboard: Settings → Verification
- Upload docs; Paddle emails back within 2-5 business days if something's missing
- Full review: **5-15 business days** in my experience; Paddle advertises "within 2 weeks"
- **Do NOT plan your launch the day you submit KYB.** Submit 3 weeks before target launch.

**Common reasons verification is delayed:**

- Trading name on website doesn't match registered business name → add "AeroEdit is a product of {LegalName Ltd}" to the footer
- No Refund Policy page → create one (14-day refund for digital goods is the EU standard)
- Pricing page behind login → move pricing outside the auth wall
- UBO doc mismatch (address on passport != proof of address) → use a document with matching address
- Business description too vague → be specific: "Subscription-based AI image editing SaaS for creators, sold monthly/annually"

### Soft-live during KYB review (important sequence)

Paddle needs to **review the actual production site** to approve you. Which means:

**You deploy to your production domain with sandbox Paddle _before_ KYB approval, not after.**

Timeline:

| Phase | Site state | Paddle state | Can take real money? |
| --- | --- | --- | --- |
| 1. Soft-live | Deployed to prod domain, all legal pages, pricing visible, signup + checkout work | `NEXT_PUBLIC_PADDLE_ENV=sandbox`, sandbox price IDs | No — checkout popup says "Sandbox" |
| 2. Submit KYB | Same | Same | No |
| 3. Paddle reviews (5-15 days) | Same | Same | No |
| 4. KYB approved | Same | Flip env to `production`, paste live price IDs, redeploy | **Yes** |
| 5. Public launch | Same | Live | Yes |

What Paddle looks for during review:
- [ ] Site reachable at the final domain (not Vercel preview URLs, not `.vercel.app`)
- [ ] Pricing page visible **without login** — actual prices, currency, billing frequency
- [ ] Terms of Service, Privacy Policy, Refund Policy, Contact — all linked from footer
- [ ] Signup → checkout popup flow works end-to-end (sandbox Paddle is fine)
- [ ] Product matches the description on the pricing page
- [ ] Business/trading name visible in footer

What does NOT need to work during review:
- Real payments (obvious — that's what KYB unblocks)
- Email confirmation at scale (custom SMTP can be set up later in the flow)
- Full Gemini production key — dev key is fine for review, they don't stress-test generations

**A "beta" or "invite-only" banner is acceptable** during soft-live. A password-gated site is not — Paddle needs to actually reach the pages.

**While you wait for KYB**, you can still do all the Supabase / Vercel / code work below.

### Required legal pages on the site

- [ ] Terms of Service
- [ ] Privacy Policy (GDPR + CCPA disclosures: what you collect, why, how long, who you share with)
- [ ] Refund Policy (be explicit: credits consumed are non-refundable; unused portion of monthly sub is refundable within 14 days)
- [ ] Acceptable Use Policy (no CSAM, no NCII, no deepfakes of real people without consent, no copyrighted content without license) — also required by Gemini's usage policies
- [ ] Cookie banner if serving EU traffic (Paddle.js and Supabase both set cookies)
- [ ] DMCA / takedown email address

Recommendation: use [Termly](https://termly.io/) or [Iubenda](https://iubenda.com/) to generate, ~$10-20/mo. Do not paste random templates off the internet — they won't cover your actual data practices.

## 1. Infrastructure

### Supabase: sandbox → paid

The current setup is running on Supabase's free tier which:

- Pauses the project after 7 days of inactivity (your keepalive cron in `app/api/cron/` mitigates this but isn't a substitute)
- Hard-caps the DB at 500 MB
- Hard-caps file storage at 1 GB (you store source + result per generation — this fills fast)
- Limits you to 2 GB bandwidth/month
- No daily backups

**Upgrade steps:**

1. In Supabase dashboard: Billing → upgrade to **Pro** ($25/mo base). Add-ons pay-per-use:
   - Storage: $0.021/GB/mo beyond 100 GB included
   - Egress: $0.09/GB beyond 250 GB included
   - DB size: $0.125/GB/mo beyond 8 GB included
2. Enable **Point-in-Time Recovery** (PITR) — an extra $10/mo but lets you rewind by the minute. Worth it for a payments app.
3. Under Settings → Database → set a **strong database password** and rotate it away from whatever you used locally
4. Configure **custom SMTP** (Resend or Postmark) — Supabase's default SMTP is rate-limited to 4 emails/hour in production. Without this, signup confirmations will be dropped under any real load.
5. Set **auth email templates** (`supabase/email-templates/` is already set up locally — apply them remotely)
6. Enable **Row-Level Security (RLS)** audit: run `select * from pg_policies where schemaname = 'public';` and confirm every user-data table has policies
7. **Storage bucket policies**: confirm `CreateGenerationStorageBucket` is private, not public
8. **Backups**: Pro plan includes daily backups, 7-day retention. PITR extends this.

### Vercel: production deploy

1. Promote the project to **Pro** plan if not already ($20/mo) — needed because the image upscale/expand streaming routes can run > 10 s on Hobby, and Hobby has a hard 10s timeout
2. Set `maxDuration` on streaming routes if they can exceed 60 s — add `export const maxDuration = 300;` to the route file header
3. Configure **Environment Variables** in Vercel — see [section 2](#2-environment-variables)
4. Set up **custom domain** — point A / CNAME at Vercel; Vercel auto-provisions LetsEncrypt cert
5. Protect **preview deploys** with Vercel's password protection (you don't want random previews leaking the checkout flow)
6. **Deployment notifications**: wire to Slack or email so failed deploys don't go unnoticed
7. Add Vercel Analytics or Web Vitals (free on Pro)

### Domain

- [ ] Domain purchased (expect $10-30/yr)
- [ ] DNS pointing at Vercel
- [ ] Apex + `www` both resolving, one redirecting to the other
- [ ] SPF / DKIM / DMARC set up for your transactional sender (Resend/Postmark guide)
- [ ] MX records if you want `hello@yourdomain.com`

## 2. Environment variables

Check every value in `.env.local.example` has a **production** equivalent in Vercel.

| Variable | Sandbox source | Production source |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Local / dev project | **Prod** Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dev anon key | **Prod** anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Dev service role key | **Prod** service role key — ⚠️ treat as a root password |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3010` | `https://yourdomain.com` |
| `PADDLE_API_KEY` | `pdl_sdbx_...` | `pdl_live_...` (only available after KYB approval) |
| `PADDLE_NOTIFICATION_WEBHOOK_SECRET` | sandbox secret | production webhook secret (separate; set inside Paddle dashboard) |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | `test_...` | `live_...` |
| `NEXT_PUBLIC_PADDLE_ENV` | `sandbox` | `production` |
| `NEXT_PUBLIC_PADDLE_CREDIT_PACK_*_PRICE_ID` | sandbox price IDs | Live price IDs (must recreate in prod Paddle dashboard) |
| `NANO_BANANA_API_KEY` | Personal key | Production service-account key with billing alerts enabled |
| `NANO_BANANA_MODEL` | `gemini-3-pro-image-preview` | Same, or lock to a stable version |
| `CRON_SECRET` | any | Random 32-char string, used in Vercel cron |

**Make sure subscription price IDs** in `constants/pricing-tier.ts` are the **production** Paddle price IDs — this is easy to miss because they're hardcoded, not env vars. Consider moving them to env vars as part of go-live.

## 3. Paddle production setup

1. Complete KYB (section 0)
2. Once approved, in Paddle Live dashboard:
   - **Recreate products and prices** — sandbox items don't migrate. Match names exactly so your code still resolves tier IDs.
   - Set **tax mode** to "inclusive" for tax-inclusive regions; Paddle handles VAT/GST
   - Under **Checkout > Website approval**, add your production domain (Paddle blocks checkouts from unlisted domains)
   - Under **Developer tools > Notifications**, set webhook URL to `https://yourdomain.com/api/webhook` — copy the new signing secret into Vercel env
   - Enable the events your code listens to: `subscription.created`, `subscription.updated`, `subscription.canceled`, `transaction.completed`, `transaction.payment_failed`, `adjustment.created`
   - Configure **dunning / retry schedule** for failed payments (default 4 retries over 14 days is sensible)
   - Set up **email notifications** for failed webhooks so you catch them fast
3. Test checkout with **one real $1 transaction** before opening to users. Refund yourself immediately. Paddle supports test transactions via a named test customer but a real end-to-end is safer.

## 4. Gemini / Google AI production setup

1. Create a Google Cloud project dedicated to production (separate billing)
2. Enable billing and the Generative Language API (or Vertex, depending on which SDK path you use)
3. Create a **service account or API key** scoped only to the image model
4. Set a **billing budget** ($500/mo to start) with an email alert at 50/80/100% — [docs](https://cloud.google.com/billing/docs/how-to/budgets)
5. Consider setting a **quota limit** so runaway usage caps itself instead of the bill
6. Rotate the key out of `NANO_BANANA_API_KEY` in Vercel (Vercel lets you roll envs without redeploying)
7. Add an **abuse response plan**: if someone bypasses rate limits and racks up $5k in Gemini calls, you need a runbook

## 5. Observability

Today: `log.info/warn/error` in `utils/logger.ts`. Vercel captures these but searching them is painful at scale.

Minimum additions before go-live:

- [ ] **Error tracking** — Sentry ($0 free tier, $26/mo for 5k errors). Install `@sentry/nextjs`.
- [ ] **Uptime monitoring** — BetterStack / UptimeRobot hitting `/` and `/api/health` (create the health endpoint if it doesn't exist) every 60 s
- [ ] **Log drain** — Vercel → Axiom / Logtail so logs survive beyond Vercel's 7-day retention
- [ ] **Alert on**: webhook signature failures, 5xx rate > 1%, Gemini 4xx/5xx rate spikes, credit-sync failures

## 6. Security

- [ ] Supabase service role key is in Vercel server-side envs only (not `NEXT_PUBLIC_`)
- [ ] Paddle webhook signature verification is enforced (check `/api/webhook/` code path)
- [ ] Rate limiting on auth endpoints (brute-force prevention) — Supabase has some built-in, consider Upstash rate-limit on signup/login
- [ ] CORS locked to your domain on server-only routes
- [ ] CSP header set (Next.js config) — minimum: `default-src 'self'; connect-src 'self' *.supabase.co *.paddle.com api.anthropic.com;` etc.
- [ ] Disable Supabase email confirmations bypass — in prod, email must be confirmed before login
- [ ] Run `npm audit` or Socket.dev and clear criticals
- [ ] Enable 2FA on: GitHub, Vercel, Supabase, Paddle, Google Cloud, domain registrar — this is the actual security baseline
- [ ] Ensure no secrets are committed (`git log -p | grep -iE 'api[_-]?key|secret|token'` as a last-pass check)

## 7. Testing before launch

- [ ] Run full E2E plan in `docs/e2e-tests.md` against production URL with a real test account
- [ ] Test both Image Expand and Image Upscale flows end-to-end
- [ ] Subscribe → cancel → resubscribe cycle
- [ ] Fail a payment deliberately (Paddle test cards) and verify dunning flow
- [ ] Signup → email confirmation → login → forgot password → reset → re-login
- [ ] GitHub OAuth end-to-end
- [ ] Verify credits top-ups (if enabled) land on the account
- [ ] Check generation history displays and download works
- [ ] Cancel subscription → confirm credits behavior matches policy
- [ ] Open checkout from 3+ different countries (use VPN) — verify localized pricing
- [ ] Mobile: iOS Safari + Android Chrome, full flow
- [ ] Accessibility pass: keyboard-only navigation, screen reader basics

## 8. Content and support

- [ ] Homepage hero copy reviewed
- [ ] Pricing page final copy + tier comparison
- [ ] Changelog or "What's new" page (optional but expected)
- [ ] `support@yourdomain.com` monitored — route to Gmail or Front
- [ ] Help docs: at least "How it works", "FAQ", "Refunds"
- [ ] Status page (optional at launch; nice to have) — Instatus free tier

## 9. Launch day

- [ ] Final production deploy tagged (e.g. `v1.0.0`)
- [ ] DNS propagation verified from 3+ regions (use dnschecker.org)
- [ ] Paddle live mode enabled
- [ ] Run 3 real checkouts (friends / yourself), confirm Paddle settlement data looks correct
- [ ] Refund those 3 checkouts
- [ ] Flip auth email sender to production SMTP
- [ ] Remove any remaining `console.log` or debug flags
- [ ] Announce (Product Hunt, X, newsletter, whatever)
- [ ] Watch logs and Sentry for the first 4 hours

## 10. Day 2 — things you'll forget

- [ ] Set up weekly database backup verification (is PITR actually working?)
- [ ] Monthly review of Gemini spend vs credits sold → recompute per-gen margin
- [ ] Rotate API keys quarterly (calendar it)
- [ ] Renew domain a year out — don't let this lapse
- [ ] Tax filing reminders (Paddle files VAT/sales tax in most jurisdictions but you still owe income tax)

---

## Cost summary at launch (rough monthly, USD)

| Item | $/mo |
| --- | --- |
| Supabase Pro + PITR | $35 |
| Vercel Pro | $20 |
| Domain | $1-3 |
| Resend (transactional email) | $0 (free up to 3k/mo) |
| Sentry Team | $26 |
| Uptime monitor | $0 (free tier) |
| Termly or Iubenda | $10-20 |
| Paddle | 5% + $0.50/txn (no monthly) |
| Google Gemini | variable, budget $500 |
| **Baseline fixed** | **~$95-105** |

Plus variable AI + Paddle fees once revenue starts.
