import { Subscription } from '@paddle/paddle-node-sdk';
import Image from 'next/image';
import { Status } from '@/components/shared/status/status';
import { parseMoney } from '@/utils/paddle/parse-money';
import dayjs from 'dayjs';
import { SubscriptionHeaderActionButton } from '@/components/dashboard/subscriptions/components/subscription-header-action-button';
import { SubscriptionAlerts } from '@/components/dashboard/subscriptions/components/subscription-alerts';

interface Props {
  subscription: Subscription;
  onCanceled?: () => void;
}

export function SubscriptionHeader({ subscription, onCanceled }: Props) {
  const subscriptionItem = subscription.items[0];

  const price = subscriptionItem.quantity * parseFloat(subscription?.recurringTransactionDetails?.totals.total ?? '0');
  const formattedPrice = parseMoney(price.toString(), subscription.currencyCode);
  const frequency =
    subscription.billingCycle.frequency === 1
      ? `/${subscription.billingCycle.interval}`
      : `every ${subscription.billingCycle.frequency} ${subscription.billingCycle.interval}s`;

  const formattedStartedDate = dayjs(subscription.startedAt).format('MMM DD, YYYY');

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="w-full space-y-4">
        <SubscriptionAlerts subscription={subscription} />
        <div className="flex items-center gap-3 md:gap-4">
          {subscriptionItem.product.imageUrl && (
            <Image src={subscriptionItem.product.imageUrl} alt={subscriptionItem.product.name} width={40} height={40} />
          )}
          <span className="text-xl font-semibold leading-tight md:text-2xl">{subscriptionItem.product.name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-end gap-1">
            <span className="text-2xl font-semibold leading-none md:text-3xl">{formattedPrice}</span>
            <span className="text-sm font-medium leading-4 text-secondary">{frequency}</span>
          </div>
          <div>
            <Status status={subscription.status} />
          </div>
        </div>
        <div className="text-sm leading-5 text-secondary">Started on {formattedStartedDate}</div>
      </div>
      <div className="w-full lg:w-auto">
        {!(subscription.scheduledChange || subscription.status === 'canceled') && (
          <SubscriptionHeaderActionButton subscriptionId={subscription.id} onCanceled={onCanceled} />
        )}
      </div>
    </div>
  );
}
