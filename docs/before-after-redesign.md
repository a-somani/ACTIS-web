# Before/After UI — Redesign Proposal

## What exists today

`components/dashboard/image-modifier/batch-image-item-card.tsx` currently implements the compare pattern as:

- Two tab buttons at the top (`Original` / `Result`) via `CompareTabs`
- When `Original` is selected, `OriginalOverlay` renders the original image centered, with the result image behind it at 25% opacity to hint the target canvas
- Clicking swaps the full image

### Why it doesn't feel right

1. **Aspect ratio mismatch is confusing.** Original is 1:1, result is 9:16 — the "original" tab shrinks the source image into a letterboxed area with a ghosted version of the result behind it. Users don't immediately understand what changed.
2. **No direct comparison.** Users have to mentally flip-book between tabs. They can't actually see expand/upscale work.
3. **The ghost overlay trick is novel but unfamiliar** — it isn't a pattern users have seen in Photoshop, Midjourney, Magnific, or Canva.
4. **Mobile suffers worst** — tabs stack awkwardly in narrow cards.

## What the rest of the industry does

I reviewed how leading AI image tools handle before/after:

| Product | Pattern | Notes |
| --- | --- | --- |
| Magnific AI | **Slider**, full-card with draggable divider | Gold standard — clear, direct, satisfying |
| Topaz Photo AI | Slider + toggle pinned corner | Power-user option |
| Adobe Generative Expand | Overlay with a ghost of original, toggle button | Closest to what we have today |
| Canva Magic Expand | Before / After dropdown, full swap | Simple, not satisfying |
| Leonardo.ai upscaler | Side-by-side with synced zoom | Best for detail inspection |
| Krea | Hover shows original, release shows result | Fast, quiet, effective |
| Remini | Slider + pinch-zoom | Mobile-first |
| Replicate demos (clarity-upscaler) | Slider | Default on their gallery |

**The slider is the de-facto standard** for upscalers and quality-enhancement tools. Expanders sometimes diverge because the canvases have different shapes — Adobe uses overlay, Canva uses swap.

## Recommendation

Pick the pattern based on which product line we're in, because our two product lines have different needs.

### Image Upscale (new product): **Draggable slider**

Same aspect ratio input/output. The slider pattern is tailor-made for this — it shows exactly which region was sharpened, denoised, detailed. Libraries worth considering:

- [`react-compare-slider`](https://github.com/nerdyman/react-compare-slider) — 3 kB, actively maintained, handles touch, has keyboard a11y, works with images of any type. **Recommended.**
- [`img-comparison-slider`](https://img-comparison-slider.sneas.io/) — web component, less React-native
- Hand-rolled — not worth it; touch/keyboard edge cases are nontrivial

### Image Expand (existing): **Overlay-within-new-canvas with a toggle**

Current approach is directionally right but needs polish. The correct metaphor is: "here's the new canvas the AI filled in, and here's exactly where your original sits inside it."

Improvements:

1. Replace tabs with a small **"Show original" toggle pill** in the corner of the image, like Photoshop's "before/after" eye icon
2. When toggled, the result image stays visible at **60% opacity** (not 25%) and the original floats in its original bounds with a **1px dashed border** showing the exact expand boundary
3. Add a small label that reads `Original: 1024×1024` next to the bounding box
4. Remove the top-of-card tabs — they compete with the actions bar and eat vertical space
5. On result state, add a subtle **"✨ Generated"** chip in the corner rather than the current green "Done" pill

## Proposed implementation sketch

### Upscaler card (new component)

```tsx
// components/dashboard/image-upscaler/upscale-item-card.tsx
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

<ReactCompareSlider
  itemOne={<ReactCompareSliderImage src={item.previewUrl} alt="Before" />}
  itemTwo={<ReactCompareSliderImage src={item.resultImage} alt="After" />}
  position={50}
  className="aspect-square rounded-md"
/>
```

### Expand card (refined overlay)

```tsx
// components/dashboard/image-modifier/batch-image-item-card.tsx
<div className="relative">
  <img src={resultImage} style={{ opacity: showOriginal ? 0.6 : 1 }} />
  {showOriginal && (
    <div
      className="absolute border border-dashed border-white/80"
      style={{
        left: `${originalLeft}%`,
        top: `${originalTop}%`,
        width: `${originalW}%`,
        height: `${originalH}%`,
      }}
    >
      <img src={previewUrl} className="h-full w-full object-cover" />
    </div>
  )}
  <button
    className="absolute bottom-2 right-2"
    onClick={() => setShowOriginal((v) => !v)}
  >
    {showOriginal ? <EyeOff /> : <Eye />} Original
  </button>
</div>
```

The original's position inside the new canvas needs to be computed from `originalImageMeta.width/height` vs the target ratio — we already have that data.

## Interaction details that matter

- **Slider handle must have keyboard support** (`ArrowLeft/Right` to move, `Home/End` to snap). `react-compare-slider` handles this.
- **Touch target ≥ 44 px** on mobile. Default handles are too small for thumbs — override CSS.
- **Double-tap to reset** to 50% is a standard affordance in this pattern.
- **Subtle animation** (slider glides to 50% on load) primes the affordance without being tacky.
- **Hover cursor** `ew-resize` on desktop.

## A11y checklist

- Alt text on both images (`Before: {filename}`, `After: {filename} upscaled`)
- `role="slider"` with `aria-valuenow` on the handle
- Live region announcing "Original 70%, Enhanced 30%" as the user drags
- Reduced-motion media query disables the entrance animation

## Rollout

1. Land `react-compare-slider` on the new upscaler first — low-risk, no migration
2. Ship the refined expand overlay as a separate PR
3. A/B test (optional) overlay vs slider on expand — if slider wins in engagement, migrate expand too despite the aspect-ratio awkwardness

## Things NOT to do

- Don't build a triple-state (before / diff / after). It adds complexity without the payoff.
- Don't auto-play the slider animation — users find it distracting after the first view.
- Don't hide the download button behind the slider handle on mobile. Keep it below the image.
