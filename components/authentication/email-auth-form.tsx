'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { loginAnonymously } from '@/app/login/actions';
import { AuthDialogPanel } from '@/components/authentication/auth-dialog-panel';
import type { AuthDialogMode } from '@/components/authentication/types';
import { useEmailAuth } from '@/components/authentication/use-email-auth';
import { useRouter } from 'next/navigation';

interface Props {
  mode: AuthDialogMode;
  nextPath?: string;
}

export function EmailAuthForm({ mode, nextPath = '/dashboard' }: Props) {
  const router = useRouter();
  const isGuestLoginEnabled = process.env.NODE_ENV !== 'production' && mode === 'login';
  const {
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
  } = useEmailAuth({ mode, nextPath });

  async function handleAnonymousLogin() {
    const result = await loginAnonymously();
    if (result?.error) {
      return;
    }

    if (result?.success) {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="px-6 pb-6 pt-8 md:px-16">
      <div className="flex flex-col items-center gap-6">
        <span className="text-3xl font-bold tracking-tight text-foreground">ACTIS</span>
        <div className="text-center text-[30px] font-medium leading-[36px] tracking-[-0.6px]">{copy.title}</div>
        <p className="text-center text-sm text-muted-foreground">{copy.description}</p>
      </div>

      {isGuestLoginEnabled ? (
        <div className="mt-6 flex flex-col gap-6">
          <Button type="button" variant="secondary" className="w-full" disabled={isSubmitting} onClick={handleAnonymousLogin}>
            Continue as Guest
          </Button>
          <div className="flex items-center justify-center">
            <Separator className="w-5/12 bg-border" />
            <div className="px-4 text-xs font-medium text-border">or</div>
            <Separator className="w-5/12 bg-border" />
          </div>
        </div>
      ) : null}

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
        onToggleMode={() => router.push(mode === 'login' ? '/signup' : '/login')}
      />
    </div>
  );
}
