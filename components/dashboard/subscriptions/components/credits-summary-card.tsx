import type { ReactNode } from 'react';
import { Coins, Sparkles } from 'lucide-react';
import type { CreditSummaryResponse } from '@/components/dashboard/create/types';

export function CreditsSummaryCard({ summary }: { summary: CreditSummaryResponse | null }) {
  const balance = summary?.balance ?? 0;
  const generationCost = summary?.generationCost ?? 10;
  const tierName = summary?.activeTierName ?? 'No active plan';

  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Credits</p>
      <div className="grid gap-1.5 rounded-2xl border border-border bg-background p-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,1fr)] md:gap-0 md:p-4">
        <SummaryItem
          icon={<Coins className="h-4 w-4" />}
          label="Balance"
          value={`${balance} Credits`}
          emphasized
        />
        <SummaryItem
          icon={<Sparkles className="h-4 w-4" />}
          label="Image cost"
          value={`${generationCost} Credits`}
          showDivider
        />
        <SummaryItem
          icon={<Sparkles className="h-4 w-4" />}
          label="Plan"
          value={tierName}
          showDivider
        />
      </div>
    </section>
  );
}

function SummaryItem({
  icon,
  label,
  value,
  emphasized = false,
  showDivider = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  emphasized?: boolean;
  showDivider?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-2 py-2.5 md:rounded-none md:px-4 md:py-2 ${showDivider ? 'md:border-l md:border-border/60' : 'md:pl-0'}`}
    >
      <div className="mb-1 flex items-center gap-2 text-primary">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">{label}</span>
      </div>
      <p className={emphasized ? 'text-2xl font-semibold leading-tight md:text-3xl' : 'text-base font-medium leading-tight md:text-lg'}>
        {value}
      </p>
    </div>
  );
}
