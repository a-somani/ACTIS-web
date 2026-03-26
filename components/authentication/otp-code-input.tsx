'use client';

import { OTPInput, REGEXP_ONLY_DIGITS, type SlotProps } from 'input-otp';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  length?: number;
  disabled?: boolean;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}

export function OtpCodeInput({ value, length = 6, disabled = false, onChange, onComplete }: Props) {
  const splitIndex = Math.ceil(length / 2);

  return (
    <OTPInput
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      maxLength={length}
      pattern={REGEXP_ONLY_DIGITS}
      disabled={disabled}
      textAlign="center"
      pushPasswordManagerStrategy="none"
      pasteTransformer={(pasted) => pasted.replace(/\D/g, '')}
      containerClassName="w-full"
      render={({ slots }) => (
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="grid min-w-0 flex-1 gap-2 sm:gap-3"
            style={{ gridTemplateColumns: `repeat(${splitIndex}, minmax(0, 1fr))` }}
          >
            {slots.slice(0, splitIndex).map((slot, index) => (
              <OtpSlot key={index} {...slot} />
            ))}
          </div>
          {length > 4 ? <OtpDivider /> : null}
          <div
            className="grid min-w-0 flex-1 gap-2 sm:gap-3"
            style={{ gridTemplateColumns: `repeat(${length - splitIndex}, minmax(0, 1fr))` }}
          >
            {slots.slice(splitIndex).map((slot, index) => (
              <OtpSlot key={splitIndex + index} {...slot} />
            ))}
          </div>
        </div>
      )}
    />
  );
}

function OtpSlot({ char, isActive, hasFakeCaret }: SlotProps) {
  return (
    <div
      className={cn(
        'relative flex h-11 w-full min-w-0 items-center justify-center rounded-xl border border-input bg-background text-base font-semibold text-foreground',
        'transition-colors sm:h-14 sm:text-lg',
        isActive && 'border-ring ring-2 ring-ring ring-offset-2 ring-offset-background'
      )}
    >
      <span>{char}</span>
      {hasFakeCaret ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-5 w-px animate-pulse bg-foreground/70 sm:h-6" />
        </span>
      ) : null}
    </div>
  );
}

function OtpDivider() {
  return <div className="h-px w-3 shrink-0 rounded-full bg-border sm:w-4" />;
}
