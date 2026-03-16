'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AuthenticationForm } from '@/components/authentication/authentication-form';
import { signup } from '@/app/signup/actions';
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSignup() {
    setError(null);

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await signup({ email, password });

      if (data?.error) {
        setError(data.error);
        return;
      }

      if (data?.requiresEmailConfirmation) {
        setEmailSent(true);
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

  if (emailSent) {
    return (
      <div className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
        <span className="text-3xl font-bold tracking-tight text-foreground">ACTIS</span>
        <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>Check your email</div>
        <p className={'text-sm text-center text-muted-foreground'}>
          We sent a confirmation link to your email. Click it to activate your account, then log in.
        </p>
        <Button variant={'secondary'} className={'w-full'} asChild>
          <Link href={'/login'}>Go to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={'#'} className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
      <span className="text-3xl font-bold tracking-tight text-foreground">ACTIS</span>
      <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>Create an account</div>
      <AuthenticationForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        password={password}
        onPasswordChange={(password) => setPassword(password)}
        isNewPassword
      />
      {error ? <p className={'w-full text-sm text-destructive'}>{error}</p> : null}
      <Button
        formAction={() => handleSignup()}
        type={'submit'}
        variant={'secondary'}
        className={'w-full'}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing up...' : 'Sign up'}
      </Button>
    </form>
  );
}
