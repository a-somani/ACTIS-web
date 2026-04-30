# Upscale — Dynamic Resolution Ladder

Replace the current static `2x / 4x` picker with a ladder that:

1. Detects source resolution client-side (we already load `originalImageMeta.width/height` in `use-image-upscaler-batch.ts`)
2. Labels the source tier (~720p, ~1080p, ~2K, etc.)
3. Shows only upscale targets **strictly greater** than the source
4. Disables targets the current backend can't deliver, with an inline note

## Resolution tier definitions

Tier is set by the **longer side** of the image.

| Tier label | Longer-side range | Short-side at 16:9 | Short-side at 4:5 (portrait) |
| --- | --- | --- | --- |
| SD | < 1280 | ~ 720 | ~ 1024 |
| ~720p | 1280–1919 | 720 | 1024 |
| ~1080p | 1920–2559 | 1080 | 1536 |
| ~QHD | 2560–3839 | 1440 | 2048 |
| ~4K | 3840–5119 | 2160 | 3072 |
| ~5K+ | 5120+ | — | — |

## Target options the UI shows

```
const UPSCALE_TARGETS = [
  { id: '1080p', label: '~1080p',    longSide: 1920, blurb: 'Full HD' },
  { id: '2k',    label: '~2K QHD',   longSide: 2560, blurb: 'Sharper for web' },
  { id: '4k',    label: '~4K UHD',   longSide: 3840, blurb: 'Print-ready' },
  { id: '8k',    label: '~8K',       longSide: 7680, blurb: 'Max detail', backend: 'chained' },
];
```

Only show a target if `target.longSide > source.longSide * 1.05`. The 5% threshold avoids offering a pointless 1080p→1080p.

## Backend capability matrix (important)

Gemini 3 Pro Image caps output at 4096px. So:

| Target | Gemini 3 Pro direct? | Path |
| --- | --- | --- |
| ~1080p | ✓ | Gemini 3 Pro 1K-2K output, $0.134/gen |
| ~2K | ✓ | Gemini 3 Pro 1K-2K output, $0.134/gen |
| ~4K | ✓ | Gemini 3 Pro 4K output, $0.24/gen |
| ~8K | ✗ | Chain: Gemini 3 Pro 4K → Real-ESRGAN 2× on Replicate (+$0.01-0.05) |

For v1 ship **up to ~4K only**. 8K shows as a locked "Business plan" option or just hide it. Don't over-promise.

## Pricing awareness in the UI

Because 4K costs almost 2× what 1K-2K costs, the picker should hint:

```
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│  ~2K QHD          │  │  ~4K UHD          │  │  ~8K              │
│  2560 × 1440      │  │  3840 × 2160      │  │  Coming soon      │
│  Sharper for web  │  │  Print-ready      │  │  🔒 Business plan │
│  1 credit         │  │  2 credits        │  │                   │
└───────────────────┘  └───────────────────┘  └───────────────────┘
```

Credit weighting reflects actual cost: 4K output = 2 credits because it's ~2× the Gemini bill.

## Implementation sketch

### Add to `utils/constants.ts`

```typescript
export interface UpscaleTarget {
  id: string;
  label: string;
  longSide: number;
  description: string;
  creditCost: number; // multiplier on base cost
}

export const UPSCALE_TARGETS: UpscaleTarget[] = [
  { id: '1080p', label: '~1080p',   longSide: 1920, description: 'Full HD',          creditCost: 1 },
  { id: '2k',    label: '~2K QHD',  longSide: 2560, description: 'Sharper for web',  creditCost: 1 },
  { id: '4k',    label: '~4K UHD',  longSide: 3840, description: 'Print-ready',      creditCost: 2 },
];

export function getSourceTierLabel(longSide: number): string {
  if (longSide < 1280) return 'SD';
  if (longSide < 1920) return '~720p';
  if (longSide < 2560) return '~1080p';
  if (longSide < 3840) return '~QHD';
  if (longSide < 5120) return '~4K';
  return '~5K+';
}

export function getAvailableUpscaleTargets(sourceLongSide: number): UpscaleTarget[] {
  const threshold = sourceLongSide * 1.05;
  return UPSCALE_TARGETS.filter((target) => target.longSide > threshold);
}
```

### Replace `ScaleSelect` with `ResolutionLadderSelect`

Props take `sourceLongSide: number | null`. If source meta hasn't loaded yet (first ~50 ms), show all targets in a disabled skeleton state. Once loaded, filter to relevant targets.

If no targets qualify (user uploaded a 5K image), show: **"Your image is already high resolution — upscale not needed."** with a CTA back to Image Expand.

### API changes

Replace `scaleFactor: '2x' | '4x'` with `targetLongSide: number`. The prompt becomes:

```
upscale this image so its longer side is approximately ${targetLongSide}px while preserving the exact aspect ratio, composition, framing, and subject details. Input is ${sourceWidth}x${sourceHeight}. [rest of existing prompt]
```

Gemini doesn't honor exact pixel dimensions reliably, but the prompt biases it toward the target tier. On response, we can server-side upscale the returned image to exact dimensions using `sharp` if we care — probably not worth it for v1.

### Card label update

`upscale-item-card.tsx` should show the **target resolution** in the file metadata line, not "4x". E.g.:

```
photo.jpg · 2.3 MB · 1920×1080 → ~4K UHD
```

## What NOT to do

- Don't let users pick a target smaller than source. It's nonsense.
- Don't offer 8K until you've wired up a real upscaler chain — Gemini alone can't deliver.
- Don't charge the same credit cost for 4K as 1K-2K. Your cost doubles; so should theirs.
- Don't label tiers with exact pixel counts ("3840×2160") as the primary label — users don't think in pixels. Use "~4K UHD" as primary, exact dimensions as secondary.
