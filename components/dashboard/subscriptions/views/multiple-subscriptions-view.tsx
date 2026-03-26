import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { SubscriptionCards } from '@/components/dashboard/subscriptions/components/subscription-cards';
import { Subscription } from '@paddle/paddle-node-sdk';

interface Props {
  subscriptions: Subscription[];
  showHeader?: boolean;
}

export function MultipleSubscriptionsView({ subscriptions, showHeader = true }: Props) {
  return (
    <>
      {showHeader ? <DashboardPageHeader pageTitle={'Subscriptions'} compact /> : null}
      <SubscriptionCards className={'grid-cols-1 gap-4 lg:grid-cols-3'} subscriptions={subscriptions} />
    </>
  );
}
