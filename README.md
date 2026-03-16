# AeroEdit

AI-powered image editor with intelligent image expansion. Built with Next.js, Supabase, and Paddle Billing.

## Features

- **Image Expand** — upload images and expand them to different aspect ratios using AI (Gemini). Batch processing with progress tracking and download.
- **Subscription management** — three-tier pricing with monthly/annual billing, powered by Paddle. Customers can view, cancel, and update payment methods.
- **Localized pricing** — prices automatically adjust for 200+ markets via Paddle.js.
- **Auth** — email/password and GitHub OAuth via Supabase. Forgot password flow included.
- **Payments dashboard** — transaction history with pagination, scoped by subscription.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Auth & DB | [Supabase](https://supabase.com/) |
| Billing | [Paddle Billing](https://www.paddle.com/billing) |
| AI | [Google Gemini](https://ai.google.dev/) (image generation) |
| UI | [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/) |
| Testing | [Vitest](https://vitest.dev/) (unit/integration) |
| Deployment | [Vercel](https://vercel.com/) |

## Getting Started

### Prerequisites

- Node.js >= 20
- [pnpm](https://pnpm.io/)
- Supabase project (or local via `supabase start`)
- Paddle sandbox account
- Google AI API key (for Image Expand)

### Install

```bash
pnpm install
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_SITE_URL` | Your app URL (`http://localhost:3000` locally, deployed URL in production) |
| `PADDLE_API_KEY` | Paddle API key |
| `PADDLE_NOTIFICATION_WEBHOOK_SECRET` | Paddle webhook secret |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Paddle client-side token |
| `NEXT_PUBLIC_PADDLE_ENV` | `sandbox` or `production` |
| `NANO_BANANA_API_KEY` | Google AI API key for image generation |
| `NANO_BANANA_MODEL` | Gemini model name (e.g. `gemini-3-pro-image-preview`) |
| `CRON_SECRET` | Optional secret for the Supabase keepalive cron endpoint |

### Run

```bash
pnpm dev
```

App starts at [http://localhost:3000](http://localhost:3000).

### Database

```bash
# Local Supabase setup
pnpm db:setup:local

# Reset local DB
pnpm db:reset:local

# Reset remote DB (interactive)
pnpm db:reset:remote
```

## Project Structure

```
app/
├── auth/callback/          # OAuth and email confirmation handler
├── checkout/               # Paddle checkout and success pages
├── dashboard/              # Protected dashboard (Image Expand, Subscriptions, Payments)
├── login/                  # Login page and actions
├── signup/                 # Signup page and actions
├── api/
│   ├── image-modifier/     # AI image expansion endpoints
│   ├── webhook/            # Paddle webhook handler
│   └── cron/               # Supabase keepalive cron
└── page.tsx                # Homepage with pricing

components/
├── authentication/         # Login/signup forms
├── checkout/               # Checkout UI
├── dashboard/
│   ├── image-modifier/     # Image Expand workbench
│   ├── layout/             # Sidebar, header, loading
│   ├── subscriptions/      # Subscription views
│   └── payments/           # Payments table
└── home/                   # Homepage sections (header, hero, pricing, footer)

utils/
├── supabase/               # Supabase client helpers
├── paddle/                 # Paddle API helpers
└── image-modifier-helpers.ts
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm prettier` | Format all files |
| `pnpm test` | Lint + format check + run unit tests |
| `pnpm test:unit` | Run Vitest unit tests only |
| `pnpm test:watch` | Run Vitest in watch mode |

## Testing

- **Unit tests**: `tests/` directory, run with `pnpm test:unit`
- **E2E test plan**: `docs/e2e-tests.md` — reference doc for browser-based testing (give to a coding agent or run manually)

## Paddle Setup

1. Create products and prices in your [Paddle dashboard](https://sandbox-vendors.paddle.com/)
2. Update price IDs in `src/constants/pricing-tier.ts`
3. Add your deploy URL to **Checkout > Website approval**
4. Set your webhook endpoint to `https://your-domain.com/api/webhook` under **Developer tools > Notifications**
5. Use [test card `4242 4242 4242 4242`](https://developer.paddle.com/concepts/payment-methods/credit-debit-card) in sandbox
