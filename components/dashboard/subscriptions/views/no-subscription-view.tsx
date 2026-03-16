import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Album } from 'lucide-react';

export function NoSubscriptionView() {
  return (
    <>
      <DashboardPageHeader pageTitle={'Subscriptions'} />
      <div className={'grid grid-cols-12'}>
        <Card
          className={'bg-background/50 backdrop-blur-[24px] border-border p-6 col-span-12 md:col-span-6 lg:col-span-4'}
        >
          <CardHeader className="p-0 space-y-0">
            <div className="flex items-center gap-3 pb-2">
              <Album className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-xl font-medium">No subscriptions yet</CardTitle>
            </div>
          </CardHeader>
          <CardContent className={'p-0'}>
            <p className="text-sm leading-6 text-muted-foreground">
              Choose a plan to unlock AeroEdit&apos;s full capabilities.
            </p>
          </CardContent>
          <CardFooter className={'p-0 pt-6'}>
            <Button asChild={true} size={'sm'} variant={'outline'} className={'text-sm rounded-sm border-border'}>
              <Link href={'/'}>Browse plans</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
