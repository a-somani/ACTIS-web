'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { log } from '@/utils/logger';
import { resolveServerSiteUrl } from '@/utils/server-site-url';

interface FormData {
  email: string;
  password: string;
}
export async function login(data: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    log.warn('Login failed', { action: 'login', email: data.email, reason: error.message });
    return { error: error.message };
  }

  log.info('Login succeeded', { action: 'login', email: data.email });
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signInWithGoogle(nextPath = '/dashboard') {
  const supabase = await createClient();
  const redirectBaseUrl = await resolveServerSiteUrl();
  const redirectUrl = new URL('/auth/callback', redirectBaseUrl);
  redirectUrl.searchParams.set('next', nextPath);
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl.toString(),
    },
  });
  if (data.url) {
    log.info('Google OAuth started', { action: 'signInWithGoogle' });
    return { url: data.url };
  }

  log.warn('Google OAuth failed to start', { action: 'signInWithGoogle' });
  return { error: 'Unable to start Google login.' };
}

export async function resetPassword(email: string) {
  const supabase = await createClient();
  const redirectBaseUrl = await resolveServerSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${redirectBaseUrl}/auth/callback?next=/dashboard`,
  });

  if (error) {
    log.warn('Password reset failed', { action: 'resetPassword', email, reason: error.message });
    return { error: error.message };
  }

  log.info('Password reset email sent', { action: 'resetPassword', email });
  return { success: true };
}

export async function loginAnonymously() {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Guest login is only enabled in development.' };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInAnonymously();
  const { error: updateUserError } = await supabase.auth.updateUser({
    email: `actis+${Date.now().toString(36)}@paddle.com`,
  });

  if (signInError || updateUserError) {
    log.warn('Anonymous login failed', {
      action: 'loginAnonymously',
      reason: signInError?.message ?? updateUserError?.message,
    });
    return { error: signInError?.message ?? updateUserError?.message ?? 'Something went wrong' };
  }

  log.info('Anonymous login succeeded', { action: 'loginAnonymously' });
  revalidatePath('/', 'layout');
  return { success: true };
}
