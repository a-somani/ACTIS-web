import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Album } from 'lucide-react';

export function NoSubscriptionView({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <>
      {showHeader ? <DashboardPageHeader pageTitle={'Subscriptions'} compact /> : null}
      <div className="grid grid-cols-12">
        <section className="col-span-12 space-y-3 rounded-2xl bg-background/35 p-3 md:col-span-6 lg:col-span-4">
          <div className="flex items-center gap-2.5">
            <Album className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-medium">No subscriptions yet</h2>
          </div>
          <p className="text-sm leading-5 text-muted-foreground">Choose a plan to unlock ACTIS&apos;s full capabilities.</p>
          <Button asChild={true} size={'sm'} variant={'outline'} className={'text-sm rounded-sm border-border'}>
            <Link href={'/'}>Browse plans</Link>
          </Button>
        </section>
      </div>
    </>
  );
}
