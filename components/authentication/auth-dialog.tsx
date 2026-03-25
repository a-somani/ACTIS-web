'use client';

import { AuthDialogPanel } from '@/components/authentication/auth-dialog-panel';
import { useEmailAuth } from '@/components/authentication/use-email-auth';
import type { AuthDialogMode } from '@/components/authentication/types';
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
  } = useEmailAuth({
    mode,
    nextPath,
    isOpen: open,
    onAuthSuccess: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-border bg-background/95 p-0 text-foreground shadow-2xl backdrop-blur-xl sm:max-w-[520px]"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
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
