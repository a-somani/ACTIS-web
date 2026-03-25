'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Coins, FolderOpenDot, Sparkles } from 'lucide-react';
import { MobileSidebar } from '@/components/dashboard/layout/mobile-sidebar';
import { Button } from '@/components/ui/button';

interface CreateTopbarProps {
  balance: number;
  generationCost: number;
  inventoryCount: number;
  tierName: string | null;
  showMobileSidebar?: boolean;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function CreateTopbar({
  balance,
  generationCost,
  inventoryCount,
  tierName,
  showMobileSidebar = true,
  actionLabel = 'Get Credits',
  actionHref = '/dashboard/subscriptions',
  onActionClick,
}: CreateTopbarProps) {
  return (
    <div className="relative z-10 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {showMobileSidebar ? (
          <div className="md:hidden">
            <MobileSidebar />
          </div>
        ) : null}
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 md:text-xs">ACTIS Create</p>
          <h1 className="text-base font-semibold md:text-2xl">Create with ACTIS</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusChip icon={<Coins className="h-3.5 w-3.5" />} label="Credits" value={balance.toString()} />
        <StatusChip icon={<Sparkles className="h-3.5 w-3.5" />} label="Cost" value={generationCost.toString()} />
        <StatusChip
          icon={<FolderOpenDot className="h-3.5 w-3.5" />}
          label="Inventory"
          value={inventoryCount.toString()}
        />
        {tierName ? <StatusChip icon={<Sparkles className="h-3.5 w-3.5" />} label="Plan" value={tierName} /> : null}
        {onActionClick ? (
          <Button size="sm" className="h-9 rounded-2xl px-3 text-xs md:h-10 md:px-4 md:text-sm" onClick={onActionClick}>
            {actionLabel}
          </Button>
        ) : (
          <Button asChild size="sm" className="h-9 rounded-2xl px-3 text-xs md:h-10 md:px-4 md:text-sm">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

interface StatusChipProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function StatusChip({ icon, label, value }: StatusChipProps) {
  return (
    <div className="hidden h-10 items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 text-xs text-white/80 backdrop-blur-xl sm:flex">
      <span className="text-primary">{icon}</span>
      <span className="uppercase tracking-[0.2em] text-[10px] text-white/45">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
