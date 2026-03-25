'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function SubscriptionsBillingSync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSyncingBilling = searchParams.get('billing') === 'success';

  useEffect(() => {
    if (!isSyncingBilling) {
      return;
    }

    router.refresh();

    const syncTimers = [1500, 3500, 6500, 10000].map((delay) =>
      window.setTimeout(() => {
        router.refresh();
      }, delay),
    );
    const cleanupTimer = window.setTimeout(() => {
      router.replace('/dashboard/subscriptions', { scroll: false });
    }, 12000);

    return () => {
      syncTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(cleanupTimer);
    };
  }, [isSyncingBilling, router]);

  if (!isSyncingBilling) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary-foreground">
      Payment received. Updating your subscription and credits...
    </div>
  );
}
