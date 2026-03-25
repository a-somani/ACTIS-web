import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { Suspense } from 'react';
import { Subscriptions } from '@/components/dashboard/subscriptions/subscriptions';
import { SubscriptionsBillingSync } from '@/components/dashboard/subscriptions/subscriptions-billing-sync';

export default async function SubscriptionsListPage() {
  return (
    <main className="p-4 lg:gap-6 lg:p-8">
      <SubscriptionsBillingSync />
      <Suspense fallback={<LoadingScreen />}>
        <Subscriptions />
      </Suspense>
    </main>
  );
}
