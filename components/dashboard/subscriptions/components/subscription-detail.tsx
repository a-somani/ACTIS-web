'use client';

import { getSubscription } from '@/utils/paddle/get-subscription';
import { getTransactions } from '@/utils/paddle/get-transactions';
import { SubscriptionPastPaymentsCard } from '@/components/dashboard/subscriptions/components/subscription-past-payments-card';
import { SubscriptionNextPaymentCard } from '@/components/dashboard/subscriptions/components/subscription-next-payment-card';
import { SubscriptionLineItems } from '@/components/dashboard/subscriptions/components/subscription-line-items';
import { SubscriptionHeader } from '@/components/dashboard/subscriptions/components/subscription-header';
import { ErrorContent } from '@/components/dashboard/layout/error-content';
import { useCallback, useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { SubscriptionDetailResponse, TransactionResponse } from '@/lib/api.types';

interface Props {
  subscriptionId: string;
  showHeader?: boolean;
}

export function SubscriptionDetail({ subscriptionId, showHeader = true }: Props) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionDetailResponse>();
  const [transactions, setTransactions] = useState<TransactionResponse>();
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [subscriptionResponse, transactionsResponse] = await Promise.all([
        getSubscription(subscriptionId),
        getTransactions(subscriptionId, ''),
      ]);

      if (subscriptionResponse) {
        setSubscription(subscriptionResponse);
      }

      if (transactionsResponse) {
        setTransactions(transactionsResponse);
      }
      setLoading(false);
    })();
  }, [subscriptionId, refreshKey]);

  if (loading) {
    return <LoadingScreen />;
  } else if (subscription?.data && transactions?.data) {
    return (
      <div className="space-y-4 md:space-y-5">
        {showHeader ? <DashboardPageHeader pageTitle={'Subscriptions'} compact /> : null}
        <div className="rounded-[28px] border border-border bg-background/40 p-4 backdrop-blur-[24px] md:p-5">
          <SubscriptionHeader subscription={subscription.data} onCanceled={refetch} />
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)] xl:gap-5">
          <div className="grid auto-rows-max grid-cols-1 gap-4 xl:gap-5">
            <SubscriptionNextPaymentCard transactions={transactions.data} subscription={subscription.data} />
            <SubscriptionPastPaymentsCard transactions={transactions.data} subscriptionId={subscriptionId} />
          </div>
          <div className="grid auto-rows-max grid-cols-1 gap-4 xl:gap-5">
            <SubscriptionLineItems subscription={subscription.data} />
          </div>
        </div>
      </div>
    );
  } else {
    return <ErrorContent />;
  }
}
