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
  onChange: (value: string) => void;
}

export function RatioSelect({ value, options, onChange }: RatioSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="target-ratio" className="text-sm font-medium">
        Output ratio
      </label>
      <Select value={value} onValueChange={onChange}>
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
