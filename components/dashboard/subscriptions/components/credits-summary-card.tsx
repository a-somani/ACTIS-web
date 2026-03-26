import type { ReactNode } from 'react';
import { Coins, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreditSummaryResponse } from '@/components/dashboard/create/types';

export function CreditsSummaryCard({ summary }: { summary: CreditSummaryResponse | null }) {
  const balance = summary?.balance ?? 0;
  const generationCost = summary?.generationCost ?? 10;
  const tierName = summary?.activeTierName ?? 'No active plan';

  return (
    <Card className="border-border bg-background/50 p-4 backdrop-blur-[24px] md:p-5">
      <CardHeader className="space-y-1 p-0">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Credits</p>
        <CardTitle className="text-xl font-semibold md:text-2xl">Usage snapshot</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-0 pt-4 md:grid-cols-3">
        <SummaryItem
          icon={<Coins className="h-4 w-4" />}
          label="Available now"
          value={balance.toString()}
          description="Current balance ready to spend."
        />
        <SummaryItem
          icon={<Sparkles className="h-4 w-4" />}
          label="Per generation"
          value={`${generationCost} credits`}
          description="Standard ACTIS Create cost."
        />
        <SummaryItem
          icon={<Sparkles className="h-4 w-4" />}
          label="Plan"
          value={tierName}
          description="Monthly credits come from your active plan."
        />
      </CardContent>
    </Card>
  );
}

function SummaryItem({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-3.5 md:p-4">
      <div className="mb-2 flex items-center gap-2 text-primary">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-semibold md:text-2xl">{value}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
