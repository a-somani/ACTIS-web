'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { inspectAuthEmail, sendEmailOtp, verifyEmailOtp } from '@/app/auth/actions';
import { signInWithGoogle } from '@/app/login/actions';
import { AuthDialogPanel } from '@/components/authentication/auth-dialog-panel';
import type { AuthDialogCopy, AuthDialogMode, AuthLookupResult, AuthStep } from '@/components/authentication/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  mode: AuthDialogMode;
  nextPath: string;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: AuthDialogMode) => void;
}

export function AuthDialog({ open, mode, nextPath, onOpenChange, onModeChange }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [lookup, setLookup] = useState<AuthLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!open) {
      setEmail('');
      setCode('');
      setLookup(null);
      setError(null);
      setMessage(null);
      setOtpSent(false);
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    setError(null);
    setMessage(null);
    setCode('');
    setLookup(null);
    setOtpSent(false);
  }, [mode]);

  const step: AuthStep = otpSent ? 'otp' : lookup ? 'options' : 'email';
  const switchCopy =
    mode === 'login'
      ? { label: "Don't have an account?", action: 'Sign up' }
      : { label: 'Already have an account?', action: 'Log in' };

  const copy = useMemo<AuthDialogCopy>(() => {
    if (step === 'otp') {
      return {
        title: 'Enter your code',
        description: `We sent a one-time code to ${email}.`,
      };
    }

    if (lookup?.status === 'google_only') {
      return {
        title: 'Continue with Google',
        description: 'This email already uses Google sign-in for ACTIS.',
      };
    }

    if (lookup?.status === 'google_and_email') {
      return {
        title: 'Choose how to continue',
        description: 'This email can sign in with Google or a one-time email code.',
      };
    }

    if (mode === 'login') {
      return {
        title: 'Welcome back',
        description: 'Enter your email and we will guide you to the right sign-in method.',
        emailLabel: 'Continue',
      };
    }

    return {
      title: 'Create your account',
      description: 'Enter your email to create an account or continue with the right sign-in method.',
      emailLabel: 'Continue',
    };
  }, [email, lookup?.status, mode, step]);

  async function handleAuthSuccess() {
    onOpenChange(false);
    router.push(nextPath);
    router.refresh();
  }

  function resetFlow(keepEmail = true) {
    setLookup(null);
    setOtpSent(false);
    setCode('');
    setError(null);
    setMessage(null);
    if (!keepEmail) {
      setEmail('');
    }
  }

  async function requestEmailCode(status: AuthLookupResult['status']) {
    setIsSubmitting(true);
    try {
      const result = await sendEmailOtp({ email });
      if (result?.error) {
        setError(result.error);
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      setEmail(normalizedEmail);
      setLookup({ email: normalizedEmail, status });
      setOtpSent(true);
      setMessage(
        status === 'new_user'
          ? 'We sent a sign-in code. Enter it below to create your ACTIS account.'
          : 'We sent a sign-in code. Enter it below to continue.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEmailContinue() {
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError('Enter your email address to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await inspectAuthEmail({ email });
      if ('error' in result) {
        setError(result.error);
        return;
      }

      setEmail(result.email);
      setLookup(result);

      if (result.status === 'new_user' || result.status === 'email_only') {
        await requestEmailCode(result.status);
        return;
      }

      if (result.status === 'google_only') {
        setMessage('Use Google to continue with this account.');
        return;
      }

      setMessage('Choose Google or request a one-time email code.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyCode() {
    setError(null);
    setMessage(null);

    if (!code.trim()) {
      setError('Enter the code from your email to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyEmailOtp({ email, token: code });
      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.success) {
        await handleAuthSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const data = await signInWithGoogle(nextPath);

      if (data?.error) {
        setError(data.error);
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-background/95 p-0 text-foreground shadow-2xl backdrop-blur-xl sm:max-w-[520px]">
        <DialogHeader className="px-6 pb-0 pt-6 text-left sm:text-left">
          <DialogTitle className="text-2xl font-semibold tracking-tight">{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <AuthDialogPanel
          step={step}
          email={email}
          code={code}
          lookup={lookup}
          copy={copy}
          switchCopy={switchCopy}
          error={error}
          message={message}
          isSubmitting={isSubmitting}
          onEmailChange={setEmail}
          onCodeChange={setCode}
          onContinue={() => void handleEmailContinue()}
          onGoogle={handleGoogleLogin}
          onRequestCode={(status) => void requestEmailCode(status)}
          onVerifyCode={() => void handleVerifyCode()}
          onReset={() => resetFlow(false)}
          onToggleMode={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
        />
      </DialogContent>
    </Dialog>
  );
}

export type { AuthDialogMode } from '@/components/authentication/types';
