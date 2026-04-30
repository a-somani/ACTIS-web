# Marketing & Positioning Plan

Companion to `pricing-plan.md`. Covers how we present the product and drive conversion. Everything here is a recommendation, not shipped.

## Positioning

### Category

**Single-purpose AI image utility: Expand + Upscale.** Not a full image editor, not a generator — two focused tools that solve two specific painful problems.

### Head-to-head positioning

| Competitor | How we win |
| --- | --- |
| **Clipdrop ($9)** — cheaper, 50 tools bundled | "Quality over quantity. Gemini 3 Pro, not legacy open-source models." |
| **Canva ($15)** — bigger suite including Magic Expand | "Dedicated tools do it better. We're the specialist." |
| **Let's Enhance ($12)** — direct competitor | "Expand + Upscale in one place, not separate products." |
| **Magnific ($39)** — premium upscaler | "Same AI quality at half the price, and we also expand." |
| **Topaz ($199 desktop)** — pro photographer tool | "No install. No GPU. No $199 upfront. Subscribe and cancel anytime." |

### One-liner positions (pick one to A/B test)

1. **"Every aspect ratio. Every resolution. One tool."** — clean, category-defining
2. **"Post-ready photos in seconds, for every platform."** — outcome-focused
3. **"The last AI image utility you'll need for social and commerce."** — specific audience
4. **"Your photos, bigger. Your photos, any shape."** — casual, direct

Recommendation: start with #2 — it names the *why* (post-ready) and the *where* (every platform), which is what the target user is actually shopping for.

## Target users (segment by willingness to pay)

### Segment 1 — Social media managers & individual creators
- Pain: every platform wants a different aspect ratio
- Shelf: **$10-20/mo**
- Tier: **Starter ($14)**
- Volume: ~30 gens/mo
- Acquisition: TikTok, Instagram, YouTube shorts demos

### Segment 2 — E-commerce sellers (Amazon, Etsy, Shopify, eBay)
- Pain: need 2000×2000 product photos in multiple ratios, phone shots too small
- Shelf: **$20-50/mo**
- Tier: **Creator ($29)**
- Volume: ~100 gens/mo
- Acquisition: Shopify app store, Etsy subreddits, "how to take product photos" content

### Segment 3 — Real estate photographers, wedding pros
- Pain: print-ready resolution, client delivery, no time for Photoshop
- Shelf: **$30-80/mo**
- Tier: **Creator ($29) or Pro ($79)**
- Volume: ~150-400 gens/mo
- Acquisition: photographer forums, wedding photographer Facebook groups

### Segment 4 — Agencies, content studios
- Pain: batch work across clients, API needed
- Shelf: **$79-300/mo**
- Tier: **Pro ($79)** or custom Business
- Volume: ~500-2000 gens/mo
- Acquisition: direct outreach, LinkedIn, agency newsletters

## Landing page structure (proven high-convert pattern for utility SaaS)

### Above the fold
1. **H1 — outcome promise** (one of the positions above)
2. **Subhead — the "what"**: "AI that expands and upscales any image. Works in your browser. No install."
3. **Primary CTA**: "Try 5 free, no credit card"
4. **Hero visual**: live before/after slider with the result image. This single element outconverts every other hero pattern for this category (Magnific, Let's Enhance, Upscale.media all lead with it).
5. **Trust marker row**: "Powered by Google Gemini 3 Pro" + as-seen-in logos once available

### Second scroll
- **Interactive demo**: 3 pre-loaded sample images the user can expand/upscale without signing up. Critical for "prove it works on real photos" psychology.
- **Use-case cards** (4 in a grid):
  - "Repurpose one shoot for every platform" (expand, social media angle)
  - "Print-ready 4K from phone photos" (upscale, photographer angle)
  - "Amazon-ready product listings" (expand, e-commerce)
  - "Restore detail in old photos" (upscale, personal archive)

### Third scroll — proof
- Testimonial row (2-3 quotes with faces once collected)
- Side-by-side vs competitor (we produce this quality, they don't)
- "500 images processed today" live counter (builds from DB)

### Pricing section
- Annual toggle above cards, "Save 20%" chip
- 3 cards: Starter, **Creator (highlighted with "Most popular" ribbon)**, Pro
- Each card shows: price, gens/mo, key feature bullets, CTA
- Below: feature comparison table (checkmarks across tiers — compared to pricing cards, tables convert price-shoppers better)

### FAQ
- "What happens if I hit my limit?" → Upgrade anytime, no overage charges
- "Can I cancel?" → Any time, no questions
- "How is this different from Canva / Clipdrop / Magnific?" → direct comparison table
- "What file types?" → PNG, JPG, WebP up to 10 MB
- "Do you keep my images?" → 24 hour automatic delete, never used to train models

### Footer
- Legal pages (ToS, Privacy, Refund, AUP)
- Contact
- Trading name disclosure (Paddle KYB requirement: "AeroEdit is a product of {LegalName Ltd}")

## Free-trial mechanics (the conversion make-or-break)

**Lifetime 5 free gens, no credit card, email verification required.**

Why lifetime not monthly:
- Monthly free tier gets farmed by fresh-account attackers
- Lifetime forces a "commit or churn" decision after 5 gens
- Users who love the product convert; users who don't weren't going to pay anyway

Why 5 not 3 or 10:
- 3 isn't enough to test both Expand and Upscale properly
- 10 gives too much away — the AI cost on 10 free gens × $0.135 = $1.35 per lead is expensive
- 5 splits the difference: enough for "I can see this works," not enough to solve their ongoing need

Why Upscale is paywalled even on free:
- Creates a specific upgrade hook: "Upgrade to Starter to unlock Upscale"
- Much higher conversion than a generic "you ran out of credits" wall
- Mirrors the Spotify pattern ("Premium unlocks X")

## Launch channels (priority order)

1. **Product Hunt launch** — free, high-signal for SaaS utilities. Day-of campaign with friends-and-family upvotes in the first hour. Aim for top 5 of the day.
2. **Reddit** — r/SaaS, r/Entrepreneur, r/photography, r/EtsySellers. Post the product honestly, engage in comments. No paid, just value.
3. **Twitter/X demo threads** — before/after GIFs, one per day for the first month. This is how Magnific built its entire audience.
4. **TikTok/YouTube Shorts** — 15-30s "watch this phone photo become 4K" clips. Low-effort, high-reach.
5. **Google Ads for bottom-funnel keywords** — "image upscaler online", "expand image aspect ratio". Expensive CPC ($2-5) but high intent. Start at $500/mo budget.
6. **SEO content** — 10 comparison articles: "Upscale.media vs AeroEdit", "How to expand an image for Instagram Reels", etc. Long-tail, takes 3-6 months to compound.
7. **Shopify/Etsy app listings** — list as a tool in those marketplaces. Specific to the e-commerce segment.
8. **Photographer communities** — Facebook groups, r/photography, photography subreddits. One well-received thread can drive 100+ signups.

Do NOT start with:
- Paid Instagram/Meta ads (broad targeting, poor ROI for utility SaaS)
- Influencer deals at launch (save budget for after you have traction metrics)
- Affiliate program (adds complexity before you have conversion baseline)

## Conversion targets to validate pricing

If our pricing is right, these should hold in weeks 4-12:

| Metric | Target |
| --- | --- |
| Landing → signup | 3-5% |
| Signup → first-gen | 60%+ |
| First-gen → paid | 2-5% (for lifetime free tier; higher than monthly-renewing free) |
| Starter → Creator upgrade in 60 days | 15%+ |
| Churn, month 1 | < 15% |
| Churn, month 3+ | < 7% monthly |

If we're below these, lower the price. If we're above (especially first-gen → paid > 7%), we're under-charging and should test raising.

## Copy guidelines

- **Use "generations" not "credits"** — clearer, more concrete. "Credits" confuses non-technical users.
- **Always show "per month"** — never lead with annual prices even though annual saves money. Monthly anchor, annual discount.
- **Avoid jargon**: no "AI-powered", no "machine learning", no "neural network". Just "Google's best image AI."
- **Name the model**: "Powered by Gemini 3 Pro" — implicit authority transfer from Google
- **Outcome verbs, not feature verbs**: "Post it everywhere" > "Resize to multiple aspect ratios"
