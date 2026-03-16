import { Brain, Layers, Maximize, Sparkles } from 'lucide-react';

const features = [
  {
    icon: <Brain className="h-5 w-5" />,
    title: 'Context-aware fill',
    description:
      'AI analyzes your image content — textures, lighting, perspective — and extends it naturally. No visible seams.',
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: 'Batch processing',
    description:
      'Upload dozens of images at once. Set a target ratio, hit generate, and let ACTIS process your entire queue.',
  },
  {
    icon: <Maximize className="h-5 w-5" />,
    title: 'Flexible ratios',
    description:
      'Expand to any standard ratio — 16:9, 4:3, 1:1, 9:16 — or define custom dimensions. One click to switch.',
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'Production quality',
    description:
      'Output matches the resolution and quality of your original. Ready for social, print, or web — no upscaling artifacts.',
  },
];

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-8 py-20 md:py-28">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Why creators choose ACTIS
        </h2>
        <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
          Purpose-built for the workflows that matter. Fast, reliable, no learning curve.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group relative rounded-xl border border-border bg-card p-7 transition-colors hover:border-border-hover"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium">{feature.title}</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
