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
    <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]">
      <div className="font-medium text-emerald-100">Payment received.</div>
      <div className="mt-1 text-emerald-50/90">Updating your subscription details and credit balance now.</div>
    </div>
  );
}
