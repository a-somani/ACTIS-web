import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Subscription } from '@paddle/paddle-node-sdk';
import { Fragment } from 'react';
import { parseMoney } from '@/utils/paddle/parse-money';
import Image from 'next/image';

interface Props {
  subscription?: Subscription;
}

export function SubscriptionLineItems({ subscription }: Props) {
  return (
    <Card className="border-border bg-background/50 p-4 backdrop-blur-[24px] md:p-5">
      <CardTitle className="flex items-center justify-between border-b border-border pb-4">
        <span className="text-lg font-medium">Recurring products</span>
      </CardTitle>
      <CardContent className="overflow-x-auto p-0 pt-5">
        <div className="grid min-w-[640px] grid-cols-12">
          <div className={'col-span-6'}></div>
          <div className="col-span-6 flex w-full gap-4 md:gap-6">
            <div className="col-span-2 w-full text-sm font-semibold leading-4 md:text-base">Qty</div>
            <div className="col-span-2 w-full text-sm font-semibold leading-4 md:text-base">Tax</div>
            <div className="col-span-2 w-full text-right text-sm font-semibold leading-4 md:text-base">
              <span>Amount</span>
              <span className={'text-secondary text-sm leading-[14px] font-normal'}>(exc. tax)</span>
            </div>
          </div>

          {subscription?.recurringTransactionDetails?.lineItems.map((lineItem) => {
            return (
              <Fragment key={lineItem.priceId}>
                <div className="col-span-6 border-b border-border py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      {lineItem.product.imageUrl && (
                        <Image src={lineItem.product.imageUrl} width={40} height={40} alt={lineItem.product.name} />
                      )}
                    </div>
                    <div className="flex flex-col gap-2 px-2 md:px-3">
                      <div className="text-sm font-semibold leading-5 md:text-base">{lineItem.product.name}</div>
                      <div className="text-sm leading-5 text-secondary md:text-base">{lineItem.product.description}</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-6 flex w-full items-center gap-4 border-b border-border py-4 md:gap-6">
                  <div className="col-span-2 w-full text-sm font-semibold leading-4 text-secondary md:text-base">
                    {lineItem.quantity}
                  </div>
                  <div className="col-span-2 w-full text-sm font-semibold leading-4 text-secondary md:text-base">
                    {parseFloat(lineItem.taxRate) * 100}%
                  </div>
                  <div className="col-span-2 w-full text-right text-sm font-semibold leading-4 text-secondary md:text-base">
                    {parseMoney(lineItem.totals.subtotal, subscription?.currencyCode)}
                  </div>
                </div>
              </Fragment>
            );
          })}
          <div className={'col-span-6'}></div>
          <div className="col-span-6 flex w-full flex-col pt-5">
            <div className="flex justify-between border-b border-border py-3 pt-0">
              <div className="col-span-3 w-full text-sm leading-4 text-secondary md:text-base">Amount</div>
              <div className="col-span-3 w-full text-right text-sm leading-4 text-secondary md:text-base">
                {parseMoney(subscription?.recurringTransactionDetails?.totals.subtotal, subscription?.currencyCode)}
              </div>
            </div>
            <div className="flex justify-between border-b border-border py-3">
              <div className="col-span-3 w-full text-sm leading-4 text-secondary md:text-base">Tax</div>
              <div className="col-span-3 w-full text-right text-sm leading-4 text-secondary md:text-base">
                {parseMoney(subscription?.recurringTransactionDetails?.totals.tax, subscription?.currencyCode)}
              </div>
            </div>
            <div className="flex justify-between border-b border-border py-3">
              <div className="col-span-3 w-full text-sm leading-4 text-secondary md:text-base">Total (Inc. tax)</div>
              <div className="col-span-3 w-full text-right text-sm font-semibold leading-4 md:text-base">
                {parseMoney(subscription?.recurringTransactionDetails?.totals.total, subscription?.currencyCode)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
