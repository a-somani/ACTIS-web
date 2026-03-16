import { Tier } from '@/constants/pricing-tier';
import { Check } from 'lucide-react';

interface Props {
  tier: Tier;
}

export function FeaturesList({ tier }: Props) {
  return (
    <ul className="p-8 flex flex-col gap-3">
      {tier.features.map((feature: string) => (
        <li key={feature} className="flex gap-x-3 items-center">
          <Check className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-sm text-muted-foreground">{feature}</span>
        </li>
      ))}
    </ul>
  );
}
