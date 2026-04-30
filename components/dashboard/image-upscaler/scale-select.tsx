'use client';

import { cn } from '@/lib/utils';

interface ScaleOption {
  value: string;
  label: string;
}

interface ScaleSelectProps {
  value: string;
  options: ScaleOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function ScaleSelect({ value, options, disabled = false, onChange }: ScaleSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Upscale factor</label>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Upscale factor">
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
              <span className="font-semibold">{option.value}</span>
              <span>{option.label.replace(`${option.value} — `, '')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
