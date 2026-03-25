import { PricingTier } from '@/constants/pricing-tier';

export const CreateGenerationCreditCost = 10;
export const WelcomeCreditGrant = 20;

export const CreditGrantByTierId = {
  starter: 50,
  pro: 250,
  advanced: 1000,
} as const;

export type CreditTierId = keyof typeof CreditGrantByTierId;

export interface ResolvedCreditTier {
  id: CreditTierId;
  name: string;
}

export function resolveCreditTierFromPriceId(priceId: string | null | undefined): ResolvedCreditTier | null {
  if (!priceId) {
    return null;
  }

  const matchedTier = PricingTier.find((tier) => Object.values(tier.priceId).includes(priceId));
  if (!matchedTier || !(matchedTier.id in CreditGrantByTierId)) {
    return null;
  }

  return {
    id: matchedTier.id as CreditTierId,
    name: matchedTier.name,
  };
}

export function getCurrentCreditPeriodKey(date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

export function getWelcomeCreditReference(): string {
  return 'welcome:v1';
}

export function getSubscriptionCreditReference(tierId: CreditTierId, periodKey: string): string {
  return `subscription:${tierId}:${periodKey}`;
}
