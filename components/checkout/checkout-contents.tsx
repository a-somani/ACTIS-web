'use client';

import { PriceSection } from '@/components/checkout/price-section';
import { resolveSiteUrl } from '@/utils/site-url';
import { type Environments, initializePaddle, type Paddle } from '@paddle/paddle-js';
import type { CheckoutEventsData } from '@paddle/paddle-js/types/checkout/events';
import throttle from 'lodash.throttle';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface PathParams {
  priceId: string;
  [key: string]: string | string[];
}

interface Props {
  userEmail?: string;
}

export function CheckoutContents({ userEmail }: Props) {
  const { priceId } = useParams<PathParams>();
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState<number>(1);
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutEventsData | null>(null);
  const transactionId = searchParams.get('_ptxn');
  const hasCheckoutTarget = Boolean(transactionId || priceId);
  const canAdjustQuantity = Boolean(priceId) && !transactionId;

  const handleCheckoutEvents = (event: CheckoutEventsData) => {
    setCheckoutData(event);
  };

  const updateItems = useMemo(
    () =>
      throttle((paddle: Paddle, priceId: string, quantity: number) => {
        paddle.Checkout.updateItems([{ priceId, quantity }]);
      }, 1000),
    [],
  );
  const successUrl = useMemo(() => resolveSiteUrl('/checkout/success'), []);

  useEffect(() => {
    if (
      hasCheckoutTarget &&
      !paddle?.Initialized &&
      process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN &&
      process.env.NEXT_PUBLIC_PADDLE_ENV
    ) {
      initializePaddle({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
        eventCallback: (event) => {
          if (event.data && event.name) {
            handleCheckoutEvents(event.data);
          }
        },
        checkout: {
          settings: {
            variant: 'one-page',
            displayMode: 'inline',
            theme: 'dark',
            allowLogout: !userEmail,
            frameTarget: 'paddle-checkout-frame',
            frameInitialHeight: 450,
            frameStyle: 'width: 100%; background-color: transparent; border: none',
            successUrl,
          },
        },
      }).then(async (paddle) => {
        if (paddle && (transactionId || priceId)) {
          setPaddle(paddle);
          paddle.Checkout.open({
            ...(userEmail && { customer: { email: userEmail } }),
            ...(transactionId ? { transactionId } : { items: [{ priceId, quantity: 1 }] }),
          });
        }
      });
    }
  }, [hasCheckoutTarget, paddle?.Initialized, priceId, successUrl, transactionId, userEmail]);

  useEffect(() => {
    if (paddle && priceId && canAdjustQuantity && paddle.Initialized) {
      updateItems(paddle, priceId, quantity);
    }
  }, [canAdjustQuantity, paddle, priceId, quantity, updateItems]);

  if (!hasCheckoutTarget) {
    return (
      <div className={'relative flex min-h-[400px] flex-col justify-center rounded-lg border border-border bg-background p-6 md:p-10 md:pl-16 md:pt-16'}>
        <div className={'max-w-lg text-sm text-white/75'}>
          This checkout page is used for Paddle payment links. Open it from a checkout flow or transaction email to continue.
        </div>
      </div>
    );
  }

  return (
    <div className={'relative flex min-h-[400px] flex-col justify-between rounded-lg border border-border bg-background p-6 md:p-10 md:pl-16 md:pt-16'}>
      <div className={'flex flex-col md:flex-row gap-8 md:gap-16'}>
        <div className={'w-full md:w-[400px]'}>
          <PriceSection
            allowQuantityChange={canAdjustQuantity}
            checkoutData={checkoutData}
            quantity={quantity}
            handleQuantityChange={setQuantity}
          />
        </div>
        <div className={'min-w-[375px] lg:min-w-[535px]'}>
          <div className={'text-base leading-[20px] font-semibold mb-8'}>Payment details</div>
          <div className={'paddle-checkout-frame'} />
        </div>
      </div>
    </div>
  );
}
