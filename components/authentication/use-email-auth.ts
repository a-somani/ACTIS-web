'use client';

import { useEffect, useMemo, useState } from 'react';
import { signInWithGoogle } from '@/app/login/actions';
import type { AuthDialogCopy, AuthDialogMode, AuthLookupResult, AuthStep } from '@/components/authentication/types';
import {
  inspectAuthEmailClient,
  sendEmailOtpClient,
  verifyEmailOtpClient,
} from '@/utils/auth/email-auth-client';

interface UseEmailAuthOptions {
  mode: AuthDialogMode;
  nextPath?: string;
  isOpen?: boolean;
  onAuthSuccess?: () => void;
}

export function useEmailAuth({
  mode,
  nextPath = '/dashboard',
  isOpen = true,
  onAuthSuccess,
}: UseEmailAuthOptions) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [lookup, setLookup] = useState<AuthLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setCode('');
      setLookup(null);
      setError(null);
      setMessage(null);
      setOtpSent(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setError(null);
    setMessage(null);
    setCode('');
    setLookup(null);
    setOtpSent(false);
  }, [mode]);

  const step: AuthStep = otpSent ? 'otp' : lookup ? 'options' : 'email';
  const switchCopy = { label: '', action: '' };

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

    return {
      title: 'Continue to ACTIS',
      description: 'Enter your email and we will guide you to the right next step.',
      emailLabel: 'Continue',
    };
  }, [email, lookup?.status, step]);

  async function completeAuth() {
    onAuthSuccess?.();
    window.location.assign(nextPath);
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
    setError(null);

    try {
      const result = await sendEmailOtpClient(email);
      const normalizedEmail = email.trim().toLowerCase();
      setEmail(normalizedEmail);
      setLookup({ email: normalizedEmail, status: result.status });
      setOtpSent(true);
      setMessage(
        status === 'new_user'
          ? 'We sent a one-time code. Enter it below to continue into ACTIS.'
          : 'We sent a one-time code. Enter it below to continue.',
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to send a code right now.');
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
      const result = await inspectAuthEmailClient(email);
      setEmail(result.email);
      setLookup(result);

      if (result.status === 'new_user' || result.status === 'email_only' || result.status === 'google_and_email') {
        await requestEmailCode(result.status);
        return;
      }

      if (result.status === 'google_only') {
        setMessage('Use Google to continue with this account.');
        return;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to check this email right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyCode(codeOverride?: string) {
    setError(null);
    setMessage(null);
    const submittedCode = (codeOverride ?? code).trim();

    if (!submittedCode) {
      setError('Enter the code from your email to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      setCode(submittedCode);
      await verifyEmailOtpClient(email, submittedCode);
      await completeAuth();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to verify this code.');
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

  return {
    copy,
    switchCopy,
    step,
    email,
    code,
    lookup,
    error,
    message,
    isSubmitting,
    setEmail,
    setCode,
    resetFlow,
    handleEmailContinue,
    handleGoogleLogin,
    handleVerifyCode,
    requestEmailCode,
  };
}
