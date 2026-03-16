import { Tier } from '@/constants/pricing-tier';
import { cn } from '@/lib/utils';
import { Zap, Crown, Shield } from 'lucide-react';

const tierIcons: Record<string, React.ReactNode> = {
  starter: <Zap className="h-5 w-5" />,
  pro: <Crown className="h-5 w-5" />,
  advanced: <Shield className="h-5 w-5" />,
};

interface Props {
  tier: Tier;
}

export function PriceTitle({ tier }: Props) {
  const { name, featured, id } = tier;
  return (
    <div
      className={cn('flex justify-between items-center px-8 pt-8', {
        'featured-price-title': featured,
      })}
    >
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', featured ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground')}>
          {tierIcons[id]}
        </div>
        <p className="text-xl font-semibold">{name}</p>
      </div>
      {featured && (
        <div className="flex items-center px-3 py-1 rounded-xs border border-primary/20 text-sm h-[29px] featured-card-badge">
          Most popular
        </div>
      )}
    </div>
  );
}
