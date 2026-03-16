'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RatioOption {
  value: string;
  label: string;
  disabled: boolean;
}

interface RatioSelectProps {
  value: string;
  options: RatioOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function RatioSelect({ value, options, disabled = false, onChange }: RatioSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="target-ratio" className="text-sm font-medium">
        Output ratio
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="target-ratio" className="w-full">
          <SelectValue placeholder="Select output ratio" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
