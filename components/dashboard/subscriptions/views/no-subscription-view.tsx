import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Album } from 'lucide-react';

export function NoSubscriptionView({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <>
      {showHeader ? <DashboardPageHeader pageTitle={'Subscriptions'} compact /> : null}
      <div className={'grid grid-cols-12'}>
        <Card
          className={'bg-background border-border p-3.5 col-span-12 md:col-span-6 lg:col-span-4'}
        >
          <CardHeader className="p-0 space-y-0">
            <div className="flex items-center gap-2.5 pb-1">
              <Album className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-medium">No subscriptions yet</CardTitle>
            </div>
          </CardHeader>
          <CardContent className={'p-0'}>
            <p className="text-sm leading-5 text-muted-foreground">
              Choose a plan to unlock ACTIS&apos;s full capabilities.
            </p>
          </CardContent>
          <CardFooter className={'p-0 pt-3'}>
            <Button asChild={true} size={'sm'} variant={'outline'} className={'text-sm rounded-sm border-border'}>
              <Link href={'/'}>Browse plans</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
