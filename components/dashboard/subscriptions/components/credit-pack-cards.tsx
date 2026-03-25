import Link from 'next/link';
import { Coins, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditPacks } from '@/utils/credit-packs';

export function CreditPackCards() {
  if (CreditPacks.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Top up</p>
        <h2 className="text-2xl font-semibold">One-time credit packs</h2>
        <p className="text-sm text-muted-foreground">
          Buy additional credits any time without changing your subscription plan.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {CreditPacks.map((pack) => (
          <Card key={pack.id} className="border-border bg-background/50 p-6 backdrop-blur-[24px]">
            <CardHeader className="space-y-0 p-0">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Coins className="h-5 w-5" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  {pack.credits} credits
                </span>
              </div>
              <CardTitle className="text-xl font-medium">{pack.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-0 pt-5">
              <p className="text-sm leading-6 text-muted-foreground">{pack.description}</p>
              <Button asChild className="w-full rounded-md">
                <Link href={`/checkout/${pack.priceId}`}>Buy credits</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
