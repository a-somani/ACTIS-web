import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'secondaryFlipped';
}

export function ActionButton({ className, variant = 'primary', ...props }: ActionButtonProps) {
  const variantClassName =
    variant === 'secondaryFlipped'
      ? 'border border-white bg-transparent text-white hover:bg-white/10'
      : variant === 'secondary'
        ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
        : 'bg-primary text-primary-foreground hover:bg-primary/90';

  return <Button className={cn(variantClassName, className)} {...props} />;
}
