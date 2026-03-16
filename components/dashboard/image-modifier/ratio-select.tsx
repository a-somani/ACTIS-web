'use client';

import { cn } from '@/lib/utils';

interface RatioOption {
  value: string;
  label: string;
}

interface RatioSelectProps {
  value: string;
  options: RatioOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

function RatioShape({ ratio }: { ratio: string }) {
  const [w, h] = ratio.split(':').map(Number);
  const aspect = w / h;
  const maxSize = 20;
  const width = aspect >= 1 ? maxSize : Math.round(maxSize * aspect);
  const height = aspect >= 1 ? Math.round(maxSize / aspect) : maxSize;

  return (
    <div
      className="rounded-[2px] border border-current opacity-60"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

export function RatioSelect({ value, options, disabled = false, onChange }: RatioSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Output ratio</label>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Output ratio">
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'disabled:pointer-events-none disabled:opacity-50',
                isActive
                  ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                  : 'border-border text-muted-foreground',
              )}
            >
              <RatioShape ratio={option.value} />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
