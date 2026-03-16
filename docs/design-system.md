# ACTIS Design System

**Automated Creator Tooling Intelligent Software**

---

## Brand Identity

ACTIS is an AI-powered SaaS platform for creators. The brand should feel intelligent, premium, and effortlessly modern — like using a tool built by people who understand both AI and design.

**Personality:** Confident, minimal, precise, forward-thinking
**Inspiration:** QOVES (clinical precision), ChatGPT/Claude (conversational AI feel), Cursor (developer-grade polish)

---

## Color System

Dark mode is the primary experience. Light mode is secondary.

### Dark Mode (Primary)

| Token                  | HSL                      | Hex       | Usage                          |
|------------------------|--------------------------|-----------|--------------------------------|
| `--background`         | `240 10% 4%`             | `#09090b` | Page background                |
| `--foreground`         | `0 0% 98%`               | `#fafafa` | Primary text                   |
| `--card`               | `240 6% 7%`              | `#111113` | Card/panel surface             |
| `--card-foreground`    | `0 0% 98%`               | `#fafafa` | Card text                      |
| `--popover`            | `240 6% 7%`              | `#111113` | Popover/dropdown bg            |
| `--popover-foreground` | `0 0% 98%`               | `#fafafa` | Popover text                   |
| `--primary`            | `174 72% 50%`            | `#2dd4bf` | Brand accent (teal)            |
| `--primary-foreground` | `179 84% 10%`            | `#042f2e` | Text on accent bg              |
| `--secondary`          | `240 6% 12%`             | `#1c1c20` | Secondary surface              |
| `--secondary-foreground`| `240 5% 90%`            | `#e4e4e7` | Secondary text                 |
| `--muted`              | `240 5% 13%`             | `#1e1e22` | Muted/disabled bg              |
| `--muted-foreground`   | `240 4% 65%`             | `#a1a1aa` | Subdued text                   |
| `--accent`             | `240 6% 12%`             | `#1c1c20` | Interactive highlight bg       |
| `--accent-foreground`  | `0 0% 98%`               | `#fafafa` | Interactive highlight text     |
| `--destructive`        | `0 72% 51%`              | `#dc2626` | Error/danger                   |
| `--destructive-foreground`| `0 0% 98%`            | `#fafafa` | Text on destructive bg         |
| `--border`             | `240 4% 16%`             | `#27272a` | Default border                 |
| `--input`              | `240 6% 12%`             | `#1c1c20` | Input background               |
| `--ring`               | `174 72% 50%`            | `#2dd4bf` | Focus ring                     |

### Light Mode (Secondary)

| Token                  | HSL                      | Hex       |
|------------------------|--------------------------|-----------|
| `--background`         | `0 0% 100%`              | `#ffffff` |
| `--foreground`         | `240 10% 4%`             | `#09090b` |
| `--card`               | `0 0% 100%`              | `#ffffff` |
| `--card-foreground`    | `240 10% 4%`             | `#09090b` |
| `--primary`            | `174 60% 37%`            | `#0d9488` |
| `--primary-foreground` | `0 0% 100%`              | `#ffffff` |
| `--secondary`          | `240 5% 96%`             | `#f4f4f5` |
| `--secondary-foreground`| `240 6% 10%`            | `#18181b` |
| `--muted`              | `240 5% 96%`             | `#f4f4f5` |
| `--muted-foreground`   | `240 4% 46%`             | `#71717a` |
| `--border`             | `240 6% 90%`             | `#e4e4e7` |
| `--input`              | `240 6% 90%`             | `#e4e4e7` |
| `--ring`               | `174 60% 37%`            | `#0d9488` |

### Brand Scale (Teal)

Used for gradient fills, hover states, and brand accents.

| Step   | HSL                | Hex       |
|--------|--------------------|-----------|
| 50     | `166 76% 97%`      | `#f0fdfa` |
| 100    | `167 85% 89%`      | `#ccfbf1` |
| 200    | `168 84% 78%`      | `#99f6e4` |
| 300    | `171 77% 64%`      | `#5eead4` |
| 400    | `174 72% 50%`      | `#2dd4bf` |
| 500    | `174 84% 40%`      | `#14b8a6` |
| 600    | `174 60% 37%`      | `#0d9488` |
| 700    | `175 77% 26%`      | `#0f766e` |
| 800    | `176 69% 22%`      | `#115e59` |
| 900    | `176 61% 19%`      | `#134e4a` |
| 950    | `179 84% 10%`      | `#042f2e` |

### Semantic Colors

| Token       | Dark                 | Light                | Usage              |
|-------------|----------------------|----------------------|--------------------|
| `--success` | `142 71% 45%`        | `142 76% 36%`        | Positive actions   |
| `--warning` | `38 92% 50%`         | `38 92% 50%`         | Caution notices    |
| `--info`    | `217 91% 60%`        | `217 91% 60%`        | Informational      |

---

## Typography

### Font Stack

- **Primary:** Inter (via `next/font/google`)
- **Mono:** JetBrains Mono (via `next/font/google`) — for code, data, technical content
- **Fallback:** `system-ui, -apple-system, sans-serif`

### Scale

| Name    | Size   | Line Height | Weight  | Usage                        |
|---------|--------|-------------|---------|------------------------------|
| `xs`    | 12px   | 16px        | 400     | Captions, labels             |
| `sm`    | 14px   | 20px        | 400     | Body small, helper text      |
| `base`  | 16px   | 24px        | 400     | Body text                    |
| `lg`    | 18px   | 28px        | 500     | Subheadings                  |
| `xl`    | 20px   | 28px        | 600     | Section headers              |
| `2xl`   | 24px   | 32px        | 600     | Page titles                  |
| `3xl`   | 30px   | 36px        | 700     | Feature headers              |
| `4xl`   | 36px   | 40px        | 700     | Hero subheading              |
| `5xl`   | 48px   | 48px        | 700     | Hero heading                 |
| `6xl`   | 64px   | 64px        | 700     | Display/marketing            |

### Letter Spacing

- Headings (3xl+): `-0.02em` (tight)
- Body: `0em` (normal)
- Labels/caps: `0.05em` (wide)

---

## Spacing & Layout

Use Tailwind's default 4px grid: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`.

### Page Containers

| Token         | Width   | Usage                    |
|---------------|---------|--------------------------|
| `max-w-sm`    | 384px   | Login/signup cards        |
| `max-w-2xl`   | 672px   | Content panels            |
| `max-w-4xl`   | 896px   | Dashboard content         |
| `max-w-6xl`   | 1152px  | Main workspace            |
| `max-w-7xl`   | 1280px  | Marketing/full-width      |

---

## Border Radius

| Token        | Value   | Usage                        |
|--------------|---------|------------------------------|
| `--radius`   | 12px    | Base radius                  |
| `radius-xs`  | 4px     | Small chips, tags            |
| `radius-sm`  | 8px     | Inputs, small buttons        |
| `radius-md`  | 10px    | Cards, medium elements       |
| `radius-lg`  | 12px    | Panels, modals               |
| `radius-xl`  | 16px    | Large containers, hero cards |

---

## Shadows & Elevation

Dark mode shadows use `rgba(0,0,0,...)` at higher opacity since backgrounds are already dark.

| Token          | Value                                                        | Usage               |
|----------------|--------------------------------------------------------------|---------------------|
| `shadow-xs`    | `0 1px 2px rgba(0,0,0,0.3)`                                 | Subtle lift         |
| `shadow-sm`    | `0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)`     | Cards               |
| `shadow-md`    | `0 4px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)`     | Dropdowns           |
| `shadow-lg`    | `0 10px 15px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.3)`   | Modals              |
| `shadow-glow`  | `0 0 20px rgba(45,212,191,0.15)`                             | Brand accent glow   |

---

## Animations & Motion

Motion should feel responsive and intentional, never bouncy or playful.

| Name           | Duration | Easing                          | Usage                    |
|----------------|----------|---------------------------------|--------------------------|
| `fade-in`      | 200ms    | `ease-out`                      | Elements appearing       |
| `fade-out`     | 150ms    | `ease-in`                       | Elements disappearing    |
| `slide-up`     | 300ms    | `cubic-bezier(0.16,1,0.3,1)`   | Modals, panels           |
| `slide-down`   | 200ms    | `ease-out`                      | Dropdowns                |
| `scale-in`     | 200ms    | `cubic-bezier(0.16,1,0.3,1)`   | Popovers, tooltips       |
| `pulse-glow`   | 2000ms   | `ease-in-out`                   | Active/loading states    |
| `shimmer`      | 2000ms   | `linear`                        | Skeleton loading         |

### Transitions

Default transition: `150ms ease-out` for interactive states (hover, focus, active).

---

## Component Patterns

### Buttons

| Variant         | Background         | Text              | Border            |
|-----------------|--------------------|--------------------|-------------------|
| Primary         | `brand-400`        | `brand-950`        | none              |
| Secondary       | `secondary`        | `secondary-fg`     | `border`          |
| Ghost           | transparent        | `muted-foreground` | none              |
| Destructive     | `destructive`      | white              | none              |
| Outline         | transparent        | `foreground`       | `border`          |

Hover: lighten background 8-10%. Focus: 2px ring with `--ring` color, 2px offset.

### Cards

- Background: `--card`
- Border: 1px solid `--border`
- Radius: `--radius-lg`
- No shadow by default (borders define elevation in dark mode)
- Hover (interactive): border transitions to `--border-hover`

### Inputs

- Background: `--input`
- Border: 1px solid `--border`
- Radius: `--radius-sm`
- Focus: ring with `--ring`, border becomes `--ring`
- Placeholder: `--muted-foreground`

### Sidebar

- Background: `--card` or `--background`
- Active item: `--accent` bg with `--primary` text
- Inactive item: `--muted-foreground` text
- Hover: `--accent` bg

---

## Brand Glow Effects

ACTIS uses subtle teal glow effects for premium feel on key elements.

```css
/* Accent line glow — used on card tops, dividers */
background: linear-gradient(
  90deg,
  transparent 15%,
  rgba(45, 212, 191, 0.5) 50%,
  transparent 85%
);

/* Soft ambient glow — used behind featured elements */
background: radial-gradient(
  50% 50% at 50% 50%,
  rgba(45, 212, 191, 0.08) 0%,
  transparent 100%
);

/* Hard accent blur — used for subtle top-edge highlights */
background: #2dd4bf;
opacity: 0.3;
filter: blur(12px);
```

---

## Accessibility

- All text meets WCAG AA contrast (4.5:1 for body, 3:1 for large text).
- `--foreground` on `--background`: 19.5:1 ratio (AAA).
- `--muted-foreground` on `--background`: 5.7:1 ratio (AA).
- `--primary` on `--background`: 10.2:1 ratio (AAA).
- Focus rings are always visible and high-contrast.
- Interactive elements have visible hover/active states.

---

## File Reference

| File                    | Purpose                               |
|-------------------------|---------------------------------------|
| `styles/globals.css`    | All design tokens and base styles     |
| `styles/dashboard.css`  | Dashboard-specific glow effects       |
| `styles/home-page.css`  | Marketing page effects                |
| `styles/login.css`      | Auth page effects                     |
| `styles/checkout.css`   | Checkout flow effects                 |
| `styles/layout.css`     | Button/interaction animations         |
