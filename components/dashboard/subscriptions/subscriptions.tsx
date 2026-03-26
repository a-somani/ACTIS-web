import { CreditPackCards } from '@/components/dashboard/subscriptions/components/credit-pack-cards';
import { SubscriptionDetail } from '@/components/dashboard/subscriptions/components/subscription-detail';
import { NoSubscriptionView } from '@/components/dashboard/subscriptions/views/no-subscription-view';
import { MultipleSubscriptionsView } from '@/components/dashboard/subscriptions/views/multiple-subscriptions-view';
import { SubscriptionErrorView } from '@/components/dashboard/subscriptions/views/subscription-error-view';
import { getSubscriptions } from '@/utils/paddle/get-subscriptions';
import { syncCreditsForUser } from '@/utils/credits-server';
import { createClient } from '@/utils/supabase/server';
import { CreditsSummaryCard } from '@/components/dashboard/subscriptions/components/credits-summary-card';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';

export async function Subscriptions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const creditSummary = user ? await syncCreditsForUser(user) : null;
  const { data: subscriptions } = await getSubscriptions();

  if (subscriptions) {
    if (subscriptions.length === 0) {
      return (
        <div className="space-y-5">
          <DashboardPageHeader pageTitle={'Subscriptions'} compact />
          <CreditsSummaryCard summary={creditSummary} />
          <NoSubscriptionView showHeader={false} />
          <CreditPackCards />
        </div>
      );
    } else if (subscriptions.length === 1) {
      return (
        <div className="space-y-5">
          <DashboardPageHeader pageTitle={'Subscriptions'} compact />
          <CreditsSummaryCard summary={creditSummary} />
          <SubscriptionDetail subscriptionId={subscriptions[0].id} showHeader={false} />
          <CreditPackCards />
        </div>
      );
    } else {
      return (
        <div className="space-y-5">
          <DashboardPageHeader pageTitle={'Subscriptions'} compact />
          <CreditsSummaryCard summary={creditSummary} />
          <MultipleSubscriptionsView subscriptions={subscriptions} showHeader={false} />
          <CreditPackCards />
        </div>
      );
    }
  } else {
    return <SubscriptionErrorView />;
  }
}
