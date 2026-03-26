import { Separator } from '@/components/ui/separator';
import { MobileSidebar } from '@/components/dashboard/layout/mobile-sidebar';

interface Props {
  pageTitle: string;
  compact?: boolean;
}

export function DashboardPageHeader({ pageTitle, compact = false }: Props) {
  return (
    <div>
      <div className={'flex items-center gap-6'}>
        <MobileSidebar />
        <h1 className={compact ? 'text-base font-semibold md:text-2xl' : 'text-lg font-semibold md:text-4xl'}>
          {pageTitle}
        </h1>
      </div>
      <Separator className={compact ? 'relative my-5 bg-border dashboard-header-highlight' : 'relative bg-border my-8 dashboard-header-highlight'} />
    </div>
  );
}
