import { Separator } from '@/components/ui/separator';
import { MobileSidebar } from '@/components/dashboard/layout/mobile-sidebar';

interface Props {
  pageTitle: string;
  compact?: boolean;
}

export function DashboardPageHeader({ pageTitle, compact = false }: Props) {
  return (
    <div>
      <div className={compact ? 'flex items-center gap-2.5 md:gap-3' : 'flex items-center gap-4 md:gap-6'}>
        <MobileSidebar />
        <h1 className={compact ? 'text-sm font-semibold md:text-2xl' : 'text-base font-semibold md:text-4xl'}>
          {pageTitle}
        </h1>
      </div>
      <Separator className={compact ? 'relative my-3 bg-border dashboard-header-highlight md:my-4' : 'relative my-5 bg-border dashboard-header-highlight md:my-8'} />
    </div>
  );
}
