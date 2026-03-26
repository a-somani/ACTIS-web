import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PaymentMethodDetails } from '@/components/dashboard/subscriptions/components/payment-method-details';
import { PaymentType, Transaction } from '@paddle/paddle-node-sdk';

function findPaymentMethodDetails(transactions?: Transaction[]) {
  const transactionWithPaymentDetails = transactions?.find((transaction) => transaction.payments[0]?.methodDetails);
  const firstValidPaymentMethod = transactionWithPaymentDetails?.payments[0].methodDetails;
  return firstValidPaymentMethod ? firstValidPaymentMethod : { type: 'unknown' as PaymentType, card: null };
}

interface Props {
  updatePaymentMethodUrl?: string | null;
  transactions?: Transaction[];
}

export function PaymentMethodSection({ transactions, updatePaymentMethodUrl }: Props) {
  const { type, card } = findPaymentMethodDetails(transactions);
  if (type === 'unknown') {
    return null;
  }
  return (
    <div className={'flex items-end justify-between gap-4 pt-5 @16xs:flex-wrap md:gap-6 md:pt-6'}>
      <div className={'flex flex-col gap-2.5 md:gap-4'}>
        <div className={'whitespace-nowrap text-sm leading-4 text-secondary md:text-base'}>Payment method</div>
        <div className={'flex gap-1 items-end'}>
          <PaymentMethodDetails type={type} card={card} />
        </div>
      </div>
      {updatePaymentMethodUrl && (
        <div>
          <Button asChild={true} size={'sm'} className={'text-sm rounded-sm border-border'} variant={'outline'}>
            <Link target={'_blank'} href={updatePaymentMethodUrl}>
              Update
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
