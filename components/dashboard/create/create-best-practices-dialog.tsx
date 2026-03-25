'use client';

import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateBestPractices } from '@/components/dashboard/create/constants';

interface CreateBestPracticesDialogProps {
  children: ReactNode;
}

export function CreateBestPracticesDialog({ children }: CreateBestPracticesDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-border bg-background/95 text-foreground backdrop-blur-xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Image Sourcing Best Practices</DialogTitle>
          <DialogDescription>
            Give ACTIS a clean source image so the expanded canvas feels intentional instead of stitched on.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-2">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Use This</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {CreateBestPractices.use.map((item) => (
                <li key={item} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-300">Avoid This</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {CreateBestPractices.avoid.map((item) => (
                <li key={item} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
