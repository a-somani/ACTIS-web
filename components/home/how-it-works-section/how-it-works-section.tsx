import { Upload, SlidersHorizontal, Download } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: <Upload className="h-5 w-5" />,
    title: 'Upload',
    description: 'Drag and drop one or many images. Supports PNG, JPG, and WebP up to 10MB each.',
  },
  {
    number: '02',
    icon: <SlidersHorizontal className="h-5 w-5" />,
    title: 'Choose ratio',
    description: 'Pick from standard aspect ratios or set a custom target. The same ratio applies across your batch.',
  },
  {
    number: '03',
    icon: <Download className="h-5 w-5" />,
    title: 'Generate & download',
    description: 'AI expands each image to your target ratio. Download individually or grab the full batch at once.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-8 py-20 md:py-28">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Three steps. That&apos;s it.
        </h2>
        <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
          No complex settings, no manual editing. Upload, expand, download.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="relative text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-primary">{step.number}</span>
                <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-xl font-medium">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
