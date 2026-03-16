# E2E Test Plan — AeroEdit (ACTIS-web)

Reference document for browser-based E2E testing. Give this to a coding agent to
run through the flows and report pass/fail.

## Prerequisites

```bash
pnpm dev          # starts on http://localhost:3000
```

Environment variables in `.env.local` must be configured (Supabase, Paddle
sandbox, Nano Banana API key).

---

## 1. Homepage

| # | Step | Expected |
|---|------|----------|
| 1.1 | Navigate to `/` | Page title is "AeroEdit". Hero heading "Powerful design tools. Simple pricing." visible. |
| 1.2 | Verify pricing tiers | Three cards: Starter, Pro, Advanced. Each has a "Get started" link. |
| 1.3 | Toggle Monthly ↔ Annual | Tabs switch. Price values update (may show loading skeleton briefly). |
| 1.4 | Localization banner | "Preview localized prices" banner visible on desktop. Country dropdown works. "Learn more" links to Paddle docs. X button dismisses the banner. |
| 1.5 | Nav link (logged out) | Shows "Sign in" link → navigates to `/login`. |
| 1.6 | Nav link (logged in) | Shows "Dashboard" link → navigates to `/dashboard`. |

---

## 2. Sign Up (`/signup`)

| # | Step | Expected |
|---|------|----------|
| 2.1 | Navigate to `/signup` | Form with Email, Password fields, "Sign up" button, "Sign up with GitHub" button, "Log in" link. |
| 2.2 | Submit empty form | Inline error: "Please enter your email and password." No toast. |
| 2.3 | Submit with valid email + short password | Inline error from Supabase (e.g. "Password should be at least 6 characters"). |
| 2.4 | Submit with valid email + valid password | Either redirects to `/dashboard` (auto-confirmed) or transitions to success state: heading changes to "Check your email", form fields hidden, "Go to Login" button shown. |
| 2.5 | Email confirmation link | Link in email points to `NEXT_PUBLIC_SITE_URL/auth/callback` (not localhost when deployed). |
| 2.6 | "Go to Login" button (after email sent) | Navigates to `/login` via client-side routing. |
| 2.7 | "Log in" link | Navigates to `/login` via client-side `<Link>` (no full page reload). |
| 2.8 | "Sign up with GitHub" button | Redirects to GitHub OAuth flow. |
| 2.9 | Password field autocomplete | Browser shows "new password" suggestions (not "current password"). |
| 2.10 | Visit `/signup` while logged in | Redirects to `/dashboard` (does not show signup form). |

---

## 3. Login (`/login`)

| # | Step | Expected |
|---|------|----------|
| 3.1 | Navigate to `/login` | Form with Email, Password, "Log in" button, "Log in with GitHub", "Sign up" link, "Forgot password?" link. In dev mode: "Log in as Guest" button visible. |
| 3.2 | Submit empty form | Inline error: "Please enter your email and password." No toast. |
| 3.3 | Submit with bad credentials | Inline error: "Invalid login credentials". |
| 3.4 | Submit with valid credentials | Redirects to `/dashboard`. Sidebar visible with "Image Expand", "Subscriptions", "Payments". |
| 3.5 | Guest login (dev only) | Click "Log in as Guest" → buttons show "Logging in..." (disabled) → redirects to `/dashboard`. |
| 3.6 | "Sign up" link | Navigates to `/signup` via client-side `<Link>` (no full page reload). |
| 3.7 | "Log in with GitHub" | Redirects to GitHub OAuth. |
| 3.8 | Error clears on retry | After seeing an error, editing a field and resubmitting clears the old error. |
| 3.9 | Forgot password (no email) | Click "Forgot password?" with empty email → inline error: "Enter your email address first, then click Forgot password." |
| 3.10 | Forgot password (with email) | Enter valid email → click "Forgot password?" → green message: "Password reset link sent. Check your email." |
| 3.11 | Visit `/login` while logged in | Redirects to `/dashboard` (does not show login form). |

---

## 4. Auth Callback (`/auth/callback`)

| # | Step | Expected |
|---|------|----------|
| 4.1 | Valid OAuth callback | Supabase exchanges code → redirects to `next` query param or `/dashboard` (default). |
| 4.2 | Invalid/expired code | Redirects to `/auth/auth-code-error`. |
| 4.3 | Password reset callback | After clicking email link → lands at `/dashboard` with valid session. |

---

## 5. Protected Route Redirect

| # | Step | Expected |
|---|------|----------|
| 5.1 | Visit `/dashboard` while logged out | Redirects to `/login`. |
| 5.2 | Visit `/dashboard/subscriptions` while logged out | Redirects to `/login`. |
| 5.3 | Visit `/dashboard/payments` while logged out | Redirects to `/login`. |
| 5.4 | Visit `/checkout/:priceId` while logged out | Page loads (checkout is not auth-gated) but Paddle checkout may show error without a valid customer email. |
| 5.5 | Visit `/image/expand` (old URL) while logged in | Redirects to `/dashboard`. |

---

## 6. Dashboard — Image Expand (`/dashboard`)

| # | Step | Expected |
|---|------|----------|
| 6.1 | Navigate while logged in | Sidebar visible with "Image Expand" (active), "Subscriptions", "Payments". Page heading: "Image Expand". Drop zone visible. |
| 6.2 | Verify controls (no images) | "Add images" button enabled. "Generate all", "Download all", "Clear all" buttons disabled. Output ratio dropdown visible (default: Story/Reel 9:16). |
| 6.3 | Add image via button | Click "Add images" → file picker opens. Select an image → image preview card appears with thumbnail, filename, ratio. |
| 6.4 | Add image via drag-and-drop | Drag image file onto drop zone → same result as 6.3. |
| 6.5 | Reject non-image file | Upload a `.txt` or non-image → should be rejected (not added to batch). |
| 6.6 | Reject oversized file | Upload image > 10MB → should be rejected. |
| 6.7 | Change output ratio | Select different ratio from dropdown → batch item cards update to reflect new target. |
| 6.8 | Generate single image | Click "Generate" on one batch card → progress indicator → result image appears. |
| 6.9 | Generate all | Click "Generate all" → all batch items process sequentially → result images appear. |
| 6.10 | Download result | After generation, click download on a card → image downloads. |
| 6.11 | Download all | Click "Download all" → all generated images download. |
| 6.12 | Clear all | Click "Clear all" → all batch items removed, drop zone reappears. |
| 6.13 | Remove single item | Click remove on one card → that item is removed from batch. |

---

## 7. Dashboard — Subscriptions (`/dashboard/subscriptions`)

| # | Step | Expected |
|---|------|----------|
| 7.1 | No subscriptions | Heading: "Subscriptions". Card: "No subscriptions yet" with icon. Text: "Choose a plan to unlock AeroEdit's full capabilities." Button: "Browse plans" → navigates to `/`. |
| 7.2 | With active subscription | Subscription card shows: plan name, status badge, next billing date, price. "Cancel" button visible. |
| 7.3 | Cancel subscription | Click cancel → confirmation dialog → confirm → status changes to "Scheduled to cancel" with effective date. |
| 7.4 | View subscription detail | Click a subscription → navigates to `/dashboard/subscriptions/:id` with full details: billing cycle, payment method, next payment, past payments. |

---

## 8. Dashboard — Payments (`/dashboard/payments`)

| # | Step | Expected |
|---|------|----------|
| 8.1 | No payments | Table with columns: Date, Amount, Status, Description. Body: "No payments yet. Payments will appear here once you subscribe to a plan." Previous/Next pagination buttons visible. |
| 8.2 | With payments | Rows show transaction date, formatted amount, status, description. |
| 8.3 | Pagination | If more than 10 results, "Next" navigates to next page. "Previous" goes back. |
| 8.4 | Payment per subscription | Navigate to `/dashboard/payments/:subscriptionId` → shows only payments for that subscription. |

---

## 9. Checkout (`/checkout/:priceId`)

| # | Step | Expected |
|---|------|----------|
| 9.1 | Navigate from pricing | Click "Get started" on a tier → navigates to `/checkout/:priceId`. |
| 9.2 | Page layout | Header: "Aero Edit — A Paddle Demo Brand" with back arrow. Two-column layout: "Order summary" (left) and "Payment details" (right). |
| 9.3 | Order summary | Shows product name, quantity selector (- 1 +), Subtotal, Tax, "Due today" total. |
| 9.4 | Payment form (valid customer) | Paddle inline checkout renders: card number, expiry, CVV fields. Apple Pay / Google Pay / PayPal buttons if available. |
| 9.5 | Payment form (no customer email) | Paddle shows "Something went wrong" with "Contact support" button (expected for guest/anonymous users). |
| 9.6 | Successful payment | After payment → redirects to `/checkout/success`. |

---

## 10. Checkout Success (`/checkout/success`)

| # | Step | Expected |
|---|------|----------|
| 10.1 | Page content | Heading: "Payment successful". Subtext: "Success! Your payment is complete, and you're all set." |
| 10.2 | CTA (logged in) | Button: "Go to Dashboard" → navigates to `/dashboard`. |
| 10.3 | CTA (logged out) | Button: "Go to Home" → navigates to `/`. |

---

## 11. Logout

| # | Step | Expected |
|---|------|----------|
| 11.1 | Logout icon | Sidebar bottom shows user email (or empty for guest) and a log out icon with `aria-label="Log out"`. |
| 11.2 | Click logout | Clears session → redirects to `/login`. |
| 11.3 | Verify logged out | Navigate to `/` → nav shows "Sign in" (not "Dashboard"). |
| 11.4 | Protected routes after logout | Visiting `/dashboard` or `/dashboard/*` → redirects to `/login`. |

---

## 12. Sidebar Navigation

| # | Step | Expected |
|---|------|----------|
| 12.1 | Image Expand link | Navigates to `/dashboard`. Active state highlighted when on `/dashboard`. |
| 12.2 | Subscriptions link | Navigates to `/dashboard/subscriptions`. |
| 12.3 | Payments link | Navigates to `/dashboard/payments`. |
| 12.4 | Logo link | Navigates to `/` (homepage). |
| 12.5 | Active state | Current page link is visually highlighted. |
| 12.6 | Mobile sidebar | On mobile, hamburger icon opens sidebar sheet with same links. |

---

## 13. API Endpoints (can test via curl/fetch)

| # | Endpoint | Method | Test | Expected |
|---|----------|--------|------|----------|
| 13.1 | `/api/cron/supabase-keepalive` | GET | No auth header, no `CRON_SECRET` set | `{ ok: true, keepalive: { ... } }` |
| 13.2 | `/api/cron/supabase-keepalive` | GET | Wrong auth header, `CRON_SECRET` set | `401 { error: "Unauthorized" }` |
| 13.3 | `/api/cron/supabase-keepalive` | GET | Correct `Bearer <CRON_SECRET>` | `{ ok: true, keepalive: { schema, table, userCount, timestamp } }` |
| 13.4 | `/api/image-modifier` | POST | No auth cookie | `401 { error: "Unauthorized" }` |
| 13.5 | `/api/image-modifier` | POST | Auth'd, no image | `400 { error: "Image is required." }` |
| 13.6 | `/api/image-modifier` | POST | Auth'd, non-image file | `400 { error: "Only image files are supported." }` |
| 13.7 | `/api/image-modifier` | POST | Auth'd, image > 10MB | `400 { error: "Image must be 10MB or smaller." }` |
| 13.8 | `/api/image-modifier` | POST | Auth'd, same source & target ratio | `400 { error: "Output ratio must be different from source ratio." }` |
| 13.9 | `/api/image-modifier/stream` | POST | Same validations as 13.4–13.8 | Same error responses |
| 13.10 | `/api/webhook` | POST | Missing `paddle-signature` header | `400 { error: "Missing signature from header" }` |
| 13.11 | `/api/webhook` | POST | Valid Paddle webhook payload | `200 { status: 200, eventName: "..." }` |

