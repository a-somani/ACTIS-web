'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { login, loginAnonymously, resetPassword } from '@/app/login/actions';
import { useState } from 'react';
import { AuthenticationForm } from '@/components/authentication/authentication-form';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isGuestLoginEnabled = process.env.NODE_ENV !== 'production';

  async function handleLogin() {
    setError(null);

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
        router.push('/dashboard');
        router.refresh();
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

  async function handleAnonymousLogin() {
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await loginAnonymously();

      if (data?.error) {
        setError(data.error);
        return;
      }

      if (data?.success) {
        router.push('/dashboard');
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={'#'} className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
      <Image src={'/assets/icons/logo/aeroedit-icon.svg'} alt={'AeroEdit'} width={80} height={80} />
      <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>
        Log in to your account
      </div>
      {isGuestLoginEnabled ? (
        <>
          <Button
            onClick={() => handleAnonymousLogin()}
            type={'button'}
            variant={'secondary'}
            className={'w-full mt-6'}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Log in as Guest'}
          </Button>
          <div className={'flex w-full items-center justify-center'}>
            <Separator className={'w-5/12 bg-border'} />
            <div className={'text-border text-xs font-medium px-4'}>or</div>
            <Separator className={'w-5/12 bg-border'} />
          </div>
        </>
      ) : null}
      <AuthenticationForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        password={password}
        onPasswordChange={(password) => setPassword(password)}
      />
      <button
        type="button"
        onClick={handleForgotPassword}
        className="w-full text-right text-sm text-muted-foreground hover:text-white transition-colors"
        disabled={isSubmitting}
      >
        Forgot password?
      </button>
      {error ? <p className={'w-full text-sm text-destructive'}>{error}</p> : null}
      {message ? <p className={'w-full text-sm text-green-500'}>{message}</p> : null}
      <Button
        formAction={() => handleLogin()}
        type={'submit'}
        variant={'secondary'}
        className={'w-full'}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  );
}
