'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, resetPassword, signInWithGoogle } from '@/app/login/actions';
import { signup } from '@/app/signup/actions';
import { AuthenticationForm } from '@/components/authentication/authentication-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export type AuthDialogMode = 'login' | 'signup';

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
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setError(null);
      setMessage(null);
      setEmailSent(false);
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    setError(null);
    setMessage(null);
    setEmailSent(false);
  }, [mode]);

  const copy = useMemo(() => {
    if (mode === 'login') {
      return {
        title: 'Welcome back',
        description: 'Log in without leaving the page.',
        submitLabel: 'Log in',
        googleLabel: 'Log in with Google',
        switchLabel: "Don't have an account?",
        switchAction: 'Sign up',
      };
    }

    return {
      title: 'Create your account',
      description: 'Sign up to start expanding images right away.',
      submitLabel: 'Sign up',
      googleLabel: 'Sign up with Google',
      switchLabel: 'Already have an account?',
      switchAction: 'Log in',
    };
  }, [mode]);

  async function handleAuthSuccess() {
    onOpenChange(false);
    router.push(nextPath);
    router.refresh();
  }

  async function handleLogin() {
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await login({ email, password });

      if (data?.error) {
        setError(data.error);
        return;
      }

      if (data?.success) {
        await handleAuthSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignup() {
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await signup({ email, password }, nextPath);

      if (data?.error) {
        setError(data.error);
        return;
      }

      if (data?.requiresEmailConfirmation) {
        setEmailSent(true);
        return;
      }

      if (data?.success) {
        await handleAuthSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setMessage(null);

    if (!email) {
      setError('Enter your email address first, then click Forgot password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await resetPassword(email);

      if (data?.error) {
        setError(data.error);
        return;
      }

      setMessage('Password reset link sent. Check your email.');
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

        {emailSent ? (
          <div className="flex flex-col gap-6 px-6 pb-6 pt-2">
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to your email. Click it to activate your account, then come back here and
              continue.
            </p>
            <Button type="button" variant="secondary" onClick={() => onModeChange('login')}>
              Go to Login
            </Button>
          </div>
        ) : (
          <form
            action="#"
            className="flex flex-col gap-6 px-6 pb-6 pt-2"
            onSubmit={(event) => {
              event.preventDefault();
              void (mode === 'login' ? handleLogin() : handleSignup());
            }}
          >
            <AuthenticationForm
              email={email}
              onEmailChange={setEmail}
              password={password}
              onPasswordChange={setPassword}
              isNewPassword={mode === 'signup'}
            />

            {mode === 'login' ? (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="w-full text-right text-sm text-muted-foreground transition-colors hover:text-foreground"
                disabled={isSubmitting}
              >
                Forgot password?
              </button>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-green-500">{message}</p> : null}

            <Button type="submit" variant="secondary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? `${copy.submitLabel}...` : copy.submitLabel}
            </Button>

            <div className="flex items-center justify-center">
              <Separator className="w-5/12 bg-border" />
              <div className="px-4 text-xs font-medium text-border">or</div>
              <Separator className="w-5/12 bg-border" />
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isSubmitting}>
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {copy.googleLabel}
            </Button>

            <div className="text-center text-sm font-medium text-muted-foreground">
              {copy.switchLabel}{' '}
              <button
                type="button"
                className="text-foreground transition-colors hover:text-primary"
                onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
              >
                {copy.switchAction}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
