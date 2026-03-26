'use client';

import type { AuthDialogCopy, AuthLookupResult, AuthStep, AuthSwitchCopy } from '@/components/authentication/types';
import { OtpCodeInput } from '@/components/authentication/otp-code-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface Props {
  step: AuthStep;
  email: string;
  code: string;
  lookup: AuthLookupResult | null;
  copy: AuthDialogCopy;
  switchCopy: AuthSwitchCopy;
  error: string | null;
  message: string | null;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onContinue: () => void;
  onGoogle: () => void;
  onRequestCode: (status: AuthLookupResult['status']) => void;
  onVerifyCode: (code?: string) => void;
  onReset: () => void;
  onToggleMode: () => void;
}

export function AuthDialogPanel({
  step,
  email,
  code,
  lookup,
  copy,
  switchCopy,
  error,
  message,
  isSubmitting,
  onEmailChange,
  onCodeChange,
  onContinue,
  onGoogle,
  onRequestCode,
  onVerifyCode,
  onReset,
  onToggleMode,
}: Props) {
  return (
    <div className="flex flex-col gap-5 px-4 pb-5 pt-2 md:gap-6 md:px-6 md:pb-6">
      <div className="grid gap-1.5">
        <Label className="text-muted-foreground leading-5" htmlFor="auth-email">
          Email address
        </Label>
        <Input
          className="border-border rounded-xs"
          type="email"
          id="auth-email"
          autoComplete="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          disabled={isSubmitting || step !== 'email'}
        />
      </div>

      {step === 'otp' ? (
        <div className="grid gap-1.5">
          <Label className="text-muted-foreground leading-5" htmlFor="auth-code">
            One-time code
          </Label>
          <OtpCodeInput value={code} length={6} onChange={onCodeChange} onComplete={onVerifyCode} disabled={isSubmitting} />
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-green-500">{message}</p> : null}

      {step === 'email' ? (
        <>
          <Button type="button" variant="secondary" className="w-full" onClick={onContinue} disabled={isSubmitting}>
            {isSubmitting ? 'Checking...' : copy.emailLabel}
          </Button>

          <div className="flex items-center justify-center">
            <Separator className="w-5/12 bg-border" />
            <div className="px-4 text-xs font-medium text-border">or</div>
            <Separator className="w-5/12 bg-border" />
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={isSubmitting}>
            Continue with Google
          </Button>
        </>
      ) : null}

      {step === 'options' && lookup?.status === 'google_only' ? (
        <>
          <Button type="button" variant="secondary" className="w-full" onClick={onGoogle} disabled={isSubmitting}>
            {isSubmitting ? 'Opening Google...' : 'Continue with Google'}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onReset} disabled={isSubmitting}>
            Use a different email
          </Button>
        </>
      ) : null}

      {step === 'options' && lookup?.status === 'google_and_email' ? (
        <>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => onRequestCode(lookup.status)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending code...' : 'Continue with email code'}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={isSubmitting}>
            Continue with Google
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onReset} disabled={isSubmitting}>
            Use a different email
          </Button>
        </>
      ) : null}

      {step === 'otp' ? (
        <>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => onVerifyCode()}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Continue'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => onRequestCode(lookup?.status ?? 'new_user')}
            disabled={isSubmitting}
          >
            Resend code
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onReset} disabled={isSubmitting}>
            Use a different email
          </Button>
        </>
      ) : null}

      {switchCopy.label && switchCopy.action ? (
        <div className="text-center text-sm font-medium text-muted-foreground">
          {switchCopy.label}{' '}
          <button type="button" className="text-foreground transition-colors hover:text-primary" onClick={onToggleMode}>
            {switchCopy.action}
          </button>
        </div>
      ) : null}
    </div>
  );
}
