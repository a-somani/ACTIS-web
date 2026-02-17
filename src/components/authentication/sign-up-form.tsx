'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AuthenticationForm } from '@/components/authentication/authentication-form';
import { signup } from '@/app/signup/actions';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSignup() {
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const data = await signup({ email, password });

      if (data?.error) {
        toast({ description: data.error, variant: 'destructive' });
        return;
      }

      if (data?.requiresEmailConfirmation) {
        setSuccessMessage('Check your email for the confirmation link, then log in.');
        setEmail('');
        setPassword('');
        return;
      }

      if (data?.success) {
        router.push('/');
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={'#'} className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
      <Image src={'/assets/icons/logo/aeroedit-icon.svg'} alt={'AeroEdit'} width={80} height={80} />
      <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>Create an account</div>
      <AuthenticationForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        password={password}
        onPasswordChange={(password) => setPassword(password)}
      />
      {successMessage ? <p className={'w-full text-sm text-center text-muted-foreground'}>{successMessage}</p> : null}
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
