'use client';

import { useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  length?: number;
  disabled?: boolean;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}

function normalizeOtpValue(value: string, length: number): string {
  return value.replace(/\D/g, '').slice(0, length);
}

export function OtpCodeInput({ value, length = 6, disabled = false, onChange, onComplete }: Props) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(() => Array.from({ length }, (_, index) => value[index] ?? ''), [length, value]);

  function emitNextValue(nextValue: string) {
    const normalized = normalizeOtpValue(nextValue, length);
    onChange(normalized);

    if (normalized.length === length) {
      onComplete?.(normalized);
    }
  }

  function focusInput(index: number) {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            'h-12 w-11 rounded-xl border border-input bg-background text-center text-lg font-semibold text-foreground',
            'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:w-12'
          )}
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => {
            const typedValue = normalizeOtpValue(event.target.value, 1);
            const nextDigits = [...digits];
            nextDigits[index] = typedValue;
            const nextValue = nextDigits.join('');
            emitNextValue(nextValue);

            if (typedValue && index < length - 1) {
              focusInput(index + 1);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !digits[index] && index > 0) {
              const nextDigits = [...digits];
              nextDigits[index - 1] = '';
              emitNextValue(nextDigits.join(''));
              focusInput(index - 1);
            }

            if (event.key === 'ArrowLeft' && index > 0) {
              event.preventDefault();
              focusInput(index - 1);
            }

            if (event.key === 'ArrowRight' && index < length - 1) {
              event.preventDefault();
              focusInput(index + 1);
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = normalizeOtpValue(event.clipboardData.getData('text'), length);
            if (!pasted) {
              return;
            }

            emitNextValue(pasted);
            focusInput(Math.min(pasted.length, length) - 1);
          }}
        />
      ))}
    </div>
  );
}
