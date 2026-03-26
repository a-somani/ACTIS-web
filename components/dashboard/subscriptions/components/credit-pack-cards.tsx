import Link from 'next/link';
import { Coins, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreditPacks } from '@/utils/credit-packs';

export function CreditPackCards() {
  if (CreditPacks.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Top up</p>
        <h2 className="text-lg font-semibold md:text-2xl">One-time credit packs</h2>
        <p className="hidden text-sm leading-5 text-muted-foreground sm:block">
          Buy additional credits any time without changing your subscription plan.
        </p>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:px-0 lg:grid-cols-3">
        {CreditPacks.map((pack) => (
          <section
            key={pack.id}
            className="min-w-[240px] shrink-0 space-y-3 rounded-2xl bg-background/35 p-3 sm:min-w-0 sm:p-4 md:p-5"
          >
            <div className="space-y-0">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Coins className="h-4 w-4" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  {pack.credits} credits
                </span>
              </div>
              <h3 className="text-base font-medium md:text-xl">{pack.name}</h3>
            </div>
            <div className="space-y-3">
              <p className="text-xs leading-4 text-muted-foreground md:text-sm md:leading-5">{pack.description}</p>
              <Button asChild className="h-10 w-full rounded-md">
                <Link href={`/checkout/${pack.priceId}`}>Buy credits</Link>
              </Button>
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
