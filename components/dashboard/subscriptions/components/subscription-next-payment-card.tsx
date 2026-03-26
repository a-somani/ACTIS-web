import { Card } from '@/components/ui/card';
import { Subscription, Transaction } from '@paddle/paddle-node-sdk';
import dayjs from 'dayjs';
import { parseMoney } from '@/utils/paddle/parse-money';
import { PaymentMethodSection } from '@/components/dashboard/subscriptions/components/payment-method-section';

interface Props {
  transactions?: Transaction[];
  subscription?: Subscription;
}

export function SubscriptionNextPaymentCard({ subscription, transactions }: Props) {
  if (!subscription?.nextBilledAt) {
    return null;
  }
  return (
    <Card className="border-0 bg-background/35 p-4 shadow-none @container md:p-5">
      <div className="flex flex-col gap-4 border-b border-border pb-4">
        <div className="text-lg font-medium">Next payment</div>
        <div className="flex flex-wrap items-end gap-1">
          <span className="text-lg font-medium leading-5 text-primary">
            {parseMoney(subscription?.nextTransaction?.details.totals.total, subscription?.currencyCode)}
          </span>
          <span className="text-sm leading-4 text-secondary">due</span>
          <span className="text-sm font-semibold leading-4 text-primary md:text-base">
            {dayjs(subscription?.nextBilledAt).format('MMM DD, YYYY')}
          </span>
        </div>
      </div>
      <PaymentMethodSection
        transactions={transactions}
        updatePaymentMethodUrl={subscription?.managementUrls?.updatePaymentMethod}
      />
    </Card>
  );
}
