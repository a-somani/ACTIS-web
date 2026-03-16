'use server';

import { validateUserSession } from '@/utils/supabase/server';
import { Subscription } from '@paddle/paddle-node-sdk';
import { revalidatePath } from 'next/cache';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { getCustomerId } from '@/utils/paddle/get-customer-id';
import { log } from '@/utils/logger';

const paddle = getPaddleInstance();

interface Error {
  error: string;
}

export async function cancelSubscription(subscriptionId: string): Promise<Subscription | Error> {
  try {
    await validateUserSession();

    const customerId = await getCustomerId();
    if (!customerId) {
      log.warn('Cancel subscription: no customer ID', { action: 'cancelSubscription', subscriptionId });
      return { error: 'Unable to verify your account. Please try again.' };
    }

    const subscription = await paddle.subscriptions.get(subscriptionId);
    if (subscription.customerId !== customerId) {
      log.warn('Cancel subscription: ownership mismatch', {
        action: 'cancelSubscription',
        subscriptionId,
        customerId,
        subscriptionCustomerId: subscription.customerId,
      });
      return { error: 'You do not have permission to cancel this subscription.' };
    }

    const canceled = await paddle.subscriptions.cancel(subscriptionId, { effectiveFrom: 'next_billing_period' });
    if (canceled) {
      log.info('Subscription canceled', { action: 'cancelSubscription', subscriptionId, customerId });
      revalidatePath('/dashboard/subscriptions');
    }
    return JSON.parse(JSON.stringify(canceled));
  } catch (e) {
    log.error('Cancel subscription failed', e, { action: 'cancelSubscription', subscriptionId });
    return { error: 'Something went wrong, please try again later' };
  }
}
