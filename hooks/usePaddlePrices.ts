import { Paddle, PricePreviewParams, PricePreviewResponse } from '@paddle/paddle-js';
import { useEffect, useState } from 'react';
import { PricingTier } from '@/constants/pricing-tier';

export type PaddlePrices = Record<string, string>;

function getLineItems(): PricePreviewParams['items'] {
  const priceId = PricingTier.map((tier) => [tier.priceId.month, tier.priceId.year]);
  return priceId.flat().map((priceId) => ({ priceId, quantity: 1 }));
}

function getPriceAmounts(prices: PricePreviewResponse) {
  return prices.data.details.lineItems.reduce((acc, item) => {
    acc[item.price.id] = item.formattedTotals.total;
    return acc;
  }, {} as PaddlePrices);
}

export function usePaddlePrices(
  paddle: Paddle | undefined,
  country: string,
): { prices: PaddlePrices; loading: boolean } {
  const [prices, setPrices] = useState<PaddlePrices>({});
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(null);
  const requestKey = `${country}:${Boolean(paddle)}`;
  const loading = Boolean(paddle) && resolvedRequestKey !== requestKey;

  useEffect(() => {
    if (!paddle) {
      return;
    }

    let isCancelled = false;
    const paddlePricePreviewRequest: Partial<PricePreviewParams> = {
      items: getLineItems(),
      ...(country !== 'OTHERS' && { address: { countryCode: country } }),
    };

    paddle.PricePreview(paddlePricePreviewRequest as PricePreviewParams)
      .then((prices) => {
        if (isCancelled) {
          return;
        }

        setPrices((prevState) => ({ ...prevState, ...getPriceAmounts(prices) }));
        setResolvedRequestKey(requestKey);
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }

        setResolvedRequestKey(requestKey);
      });

    return () => {
      isCancelled = true;
    };
  }, [country, paddle, requestKey]);

  return { prices, loading };
}
