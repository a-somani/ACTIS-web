'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpFromLine, Coins, FolderOpenDot, Sparkles } from 'lucide-react';
import { MobileSidebar } from '@/components/dashboard/layout/mobile-sidebar';
import { Button } from '@/components/ui/button';

interface UpscaleTopbarProps {
  balance: number;
  generationCost: number;
  inventoryCount: number;
  tierName: string | null;
  showMobileSidebar?: boolean;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function UpscaleTopbar({
  balance,
  generationCost,
  inventoryCount,
  tierName,
  showMobileSidebar = true,
  actionLabel = 'Get Credits',
  actionHref = '/dashboard/subscriptions',
  onActionClick,
}: UpscaleTopbarProps) {
  return (
    <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {showMobileSidebar ? (
          <div className="rounded-2xl bg-black/30 p-1.5 md:hidden">
            <MobileSidebar />
          </div>
        ) : null}
        <div className="flex min-w-0 items-center gap-2">
          <ArrowUpFromLine className="h-5 w-5 text-violet-300 md:h-6 md:w-6" />
          <h1 className="text-sm font-semibold leading-tight md:text-2xl">ACTIS Upscale</h1>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
        <StatusChip icon={<Coins className="h-3.5 w-3.5" />} label="Credits" value={balance.toString()} />
        <StatusChip icon={<Sparkles className="h-3.5 w-3.5" />} label="Cost" value={generationCost.toString()} />
        <StatusChip icon={<FolderOpenDot className="h-3.5 w-3.5" />} label="Recent" value={inventoryCount.toString()} />
        {tierName ? <StatusChip icon={<Sparkles className="h-3.5 w-3.5" />} label="Plan" value={tierName} /> : null}
        {onActionClick ? (
          <Button
            size="sm"
            className="inline-flex h-9 shrink-0 rounded-2xl bg-violet-500 px-3 text-xs text-white hover:bg-violet-600 sm:h-10 sm:px-4 sm:text-sm"
            onClick={onActionClick}
          >
            {actionLabel}
          </Button>
        ) : (
          <Button
            asChild
            size="sm"
            className="inline-flex h-9 shrink-0 rounded-2xl bg-violet-500 px-3 text-xs text-white hover:bg-violet-600 sm:h-10 sm:px-4 sm:text-sm"
          >
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
    <div className="flex h-9 items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 text-xs text-white/80 sm:h-10 sm:gap-2 sm:px-3">
      <span className="text-violet-300">{icon}</span>
      <span className="hidden uppercase tracking-[0.2em] text-[10px] text-white/45 sm:inline">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
