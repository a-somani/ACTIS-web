import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { PaymentsContent } from '@/components/dashboard/payments/payments-content';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';

export default async function PaymentsPage() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:gap-5 lg:p-8">
      <DashboardPageHeader pageTitle={'Payments'} compact />
      <Suspense fallback={<LoadingScreen />}>
        <PaymentsContent subscriptionId={''} />
      </Suspense>
    </main>
  );
}
