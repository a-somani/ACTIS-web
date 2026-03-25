import { CreditPackCards } from '@/components/dashboard/subscriptions/components/credit-pack-cards';
import { SubscriptionDetail } from '@/components/dashboard/subscriptions/components/subscription-detail';
import { NoSubscriptionView } from '@/components/dashboard/subscriptions/views/no-subscription-view';
import { MultipleSubscriptionsView } from '@/components/dashboard/subscriptions/views/multiple-subscriptions-view';
import { SubscriptionErrorView } from '@/components/dashboard/subscriptions/views/subscription-error-view';
import { getSubscriptions } from '@/utils/paddle/get-subscriptions';

export async function Subscriptions() {
  const { data: subscriptions } = await getSubscriptions();

  if (subscriptions) {
    if (subscriptions.length === 0) {
      return (
        <div className="space-y-8">
          <NoSubscriptionView />
          <CreditPackCards />
        </div>
      );
    } else if (subscriptions.length === 1) {
      return (
        <div className="space-y-8">
          <SubscriptionDetail subscriptionId={subscriptions[0].id} />
          <CreditPackCards />
        </div>
      );
    } else {
      return (
        <div className="space-y-8">
          <MultipleSubscriptionsView subscriptions={subscriptions} />
          <CreditPackCards />
        </div>
      );
    }
  } else {
    return <SubscriptionErrorView />;
  }
}
