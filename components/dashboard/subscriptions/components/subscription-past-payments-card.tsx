import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Transaction } from '@paddle/paddle-node-sdk';
import dayjs from 'dayjs';
import { parseMoney } from '@/utils/paddle/parse-money';
import { Status } from '@/components/shared/status/status';
import { getPaymentReason } from '@/utils/paddle/data-helpers';

interface Props {
  subscriptionId: string;
  transactions?: Transaction[];
}

export function SubscriptionPastPaymentsCard({ subscriptionId, transactions }: Props) {
  return (
    <Card className="border-0 bg-background/35 p-4 shadow-none @container md:p-5">
      <CardTitle className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <span className="text-lg font-medium">Payments</span>
        <Button asChild={true} size={'sm'} variant={'outline'} className={'text-sm rounded-sm border-border'}>
          <Link href={`/dashboard/payments/${subscriptionId}`}>View all</Link>
        </Button>
      </CardTitle>
      <CardContent className={'p-0'}>
        {transactions?.slice(0, 3).map((transaction) => {
          const formattedPrice = parseMoney(transaction.details?.totals?.total, transaction.currencyCode);
          return (
            <div key={transaction.id} className="flex flex-col gap-3 border-b border-border py-4 last:border-b-0 last:pb-0">
              <div className="text-sm leading-4 text-secondary">
                {dayjs(transaction.billedAt ?? transaction.createdAt).format('MMM DD, YYYY')}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold leading-4 md:text-base">{getPaymentReason(transaction.origin)}</span>
                <span className="text-sm leading-5 text-secondary md:text-base">
                  {transaction.details?.lineItems[0].product?.name}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-sm font-semibold leading-4 md:text-base">{formattedPrice}</div>
                <Status status={transaction.status} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
