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
      <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-background p-4 text-foreground sm:max-w-xl sm:p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg md:text-xl">Image sourcing tips</DialogTitle>
          <DialogDescription>
            Give ACTIS a clean source image so the expanded canvas feels intentional instead of stitched on.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 sm:grid-cols-2">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Use This</h3>
            <ul className="space-y-2 pl-4 text-sm text-muted-foreground">
              {CreateBestPractices.use.map((item) => (
                <li key={item} className="list-disc leading-5">{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-300">Avoid This</h3>
            <ul className="space-y-2 pl-4 text-sm text-muted-foreground">
              {CreateBestPractices.avoid.map((item) => (
                <li key={item} className="list-disc leading-5">{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
