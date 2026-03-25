'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { createClient as createInternalClient } from '@/utils/supabase/server-internal';
import type { AuthLookupResult } from '@/components/authentication/types';
import { log } from '@/utils/logger';

interface EmailInput {
  email: string;
}

interface VerifyOtpInput extends EmailInput {
  token: string;
}

interface AuthUserRecord {
  email?: string | null;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function resolveProviders(user: AuthUserRecord): string[] {
  const providers = new Set<string>();

  user.app_metadata?.providers?.forEach((provider) => providers.add(provider));
  if (user.app_metadata?.provider) {
    providers.add(user.app_metadata.provider);
  }

  return Array.from(providers);
}

async function lookupAuthUserByEmail(email: string) {
  const supabase = createInternalClient();
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw error;
  }

  return (data.users.find((user) => user.email?.toLowerCase() === email) ?? null) as AuthUserRecord | null;
}

export async function inspectAuthEmail({ email }: EmailInput): Promise<AuthLookupResult | { error: string }> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return { error: 'Enter your email address to continue.' };
  }

  try {
    const user = await lookupAuthUserByEmail(normalizedEmail);
    if (!user) {
      return { status: 'new_user', email: normalizedEmail };
    }

    const providers = resolveProviders(user);
    const hasGoogle = providers.includes('google');
    const hasEmail = providers.includes('email');

    if (hasGoogle && hasEmail) {
      return { status: 'google_and_email', email: normalizedEmail };
    }

    if (hasGoogle) {
      return { status: 'google_only', email: normalizedEmail };
    }

    return { status: 'email_only', email: normalizedEmail };
  } catch (error) {
    log.error('Failed to inspect auth email', error, { action: 'inspectAuthEmail', email: normalizedEmail });
    return { error: 'Unable to check this email right now.' };
  }
}

export async function sendEmailOtp({ email }: EmailInput) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return { error: 'Enter your email address to continue.' };
  }

  try {
    const inspection = await inspectAuthEmail({ email: normalizedEmail });
    if ('error' in inspection) {
      return inspection;
    }

    if (inspection.status === 'google_only') {
      return { error: 'This email is registered with Google. Continue with Google to sign in.' };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: inspection.status === 'new_user',
      },
    });

    if (error) {
      log.warn('Email OTP request failed', { action: 'sendEmailOtp', email: normalizedEmail, reason: error.message });
      return { error: error.message };
    }

    log.info('Email OTP sent', { action: 'sendEmailOtp', email: normalizedEmail, status: inspection.status });
    return { success: true, status: inspection.status };
  } catch (error) {
    log.error('Email OTP request failed unexpectedly', error, { action: 'sendEmailOtp', email: normalizedEmail });
    return { error: 'Unable to send a code right now.' };
  }
}

export async function verifyEmailOtp({ email, token }: VerifyOtpInput) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedToken = token.trim();

  if (!normalizedEmail || !normalizedToken) {
    return { error: 'Enter the code from your email to continue.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token: normalizedToken,
    type: 'email',
  });

  if (error) {
    log.warn('Email OTP verification failed', {
      action: 'verifyEmailOtp',
      email: normalizedEmail,
      reason: error.message,
    });
    return { error: error.message };
  }

  log.info('Email OTP verification succeeded', { action: 'verifyEmailOtp', email: normalizedEmail });
  revalidatePath('/', 'layout');
  return { success: true };
}
