import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="mx-auto max-w-5xl px-8 relative mt-24 md:mt-32 mb-20 md:mb-28">
      <div className="text-center w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-secondary/50 text-sm text-muted-foreground mb-8">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
          Now with batch processing
        </div>

        <h1 className="text-[44px] leading-[44px] md:text-[72px] md:leading-[72px] lg:text-[80px] lg:leading-[80px] tracking-[-0.03em] font-semibold">
          Expand any image
          <br />
          <span className="text-primary">beyond its borders</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload an image, pick a target ratio, and let AI intelligently extend it — maintaining context,
          style, and quality. One image or hundreds.
        </p>

        <div className="flex items-center justify-center gap-4 mt-10">
          <Button asChild className="h-12 px-6 text-base">
            <Link href="/signup">
              Start expanding
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-12 px-6 text-base border-border">
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>
      </div>

      <div className="mt-16 md:mt-20 relative">
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
            <div className="w-3 h-3 rounded-full bg-border" />
            <div className="w-3 h-3 rounded-full bg-border" />
            <div className="w-3 h-3 rounded-full bg-border" />
            <span className="ml-2 text-xs text-muted-foreground">ACTIS Image Expand</span>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="flex-1 relative">
                <div className="aspect-square rounded-lg bg-secondary border border-border flex items-center justify-center">
                  <div className="w-3/4 h-3/4 rounded-md bg-muted border border-dashed border-border flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Original</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">16:9</span>
              </div>

              <div className="flex-[1.78] relative">
                <div className="aspect-video rounded-lg border border-primary/30 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[56%] h-full rounded-md bg-secondary border border-border flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Original</span>
                  </div>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-primary/60 font-mono">
                    AI fill
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-primary/60 font-mono">
                    AI fill
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -inset-4 -z-10 rounded-2xl bg-primary/5 blur-2xl" />
      </div>
    </section>
  );
}
