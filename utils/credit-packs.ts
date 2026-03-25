export interface CreditPack {
  id: 'mini' | 'creator' | 'studio';
  name: string;
  credits: number;
  description: string;
  priceId: string;
}

const CreditPackDefinitions = [
  {
    id: 'mini',
    name: 'Mini Pack',
    credits: 50,
    description: 'Quick top-up for a few polished generations.',
    priceId: process.env.NEXT_PUBLIC_PADDLE_CREDIT_PACK_MINI_PRICE_ID ?? '',
  },
  {
    id: 'creator',
    name: 'Creator Pack',
    credits: 150,
    description: 'The best value for active weekly use.',
    priceId: process.env.NEXT_PUBLIC_PADDLE_CREDIT_PACK_CREATOR_PRICE_ID ?? '',
  },
  {
    id: 'studio',
    name: 'Studio Pack',
    credits: 400,
    description: 'Large one-time credit refill for teams and campaigns.',
    priceId: process.env.NEXT_PUBLIC_PADDLE_CREDIT_PACK_STUDIO_PRICE_ID ?? '',
  },
] satisfies CreditPack[];

export const CreditPacks: CreditPack[] = CreditPackDefinitions.filter((pack) => pack.priceId.length > 0);

export function resolveCreditPackFromPriceId(priceId: string | null | undefined): CreditPack | null {
  if (!priceId) {
    return null;
  }

  return CreditPacks.find((pack) => pack.priceId === priceId) ?? null;
}
