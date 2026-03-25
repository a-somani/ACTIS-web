'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { log } from '@/utils/logger';
import { resolveServerSiteUrl } from '@/utils/server-site-url';

function normalizeNextPath(nextPath: string): string {
  if (nextPath.startsWith('/') && !nextPath.startsWith('//')) {
    return nextPath;
  }

  return '/dashboard';
}

export async function signInWithGoogle(nextPath = '/dashboard') {
  try {
    const safeNextPath = normalizeNextPath(nextPath);
    const supabase = await createClient();
    const redirectBaseUrl = await resolveServerSiteUrl();
    const redirectUrl = new URL('/auth/callback', redirectBaseUrl);
    redirectUrl.searchParams.set('next', safeNextPath);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl.toString(),
      },
    });

    if (error) {
      log.warn('Google OAuth failed to start', {
        action: 'signInWithGoogle',
        reason: error.message,
        redirectUrl: redirectUrl.toString(),
      });
      return { error: 'Unable to start Google login.' };
    }

    if (data.url) {
      log.info('Google OAuth started', {
        action: 'signInWithGoogle',
        redirectUrl: redirectUrl.toString(),
      });
      return { url: data.url };
    }
  } catch (error) {
    log.error('Google OAuth failed unexpectedly', error, { action: 'signInWithGoogle' });
    return { error: 'Unable to start Google login.' };
  }

  log.warn('Google OAuth failed to start', { action: 'signInWithGoogle' });
  return { error: 'Unable to start Google login.' };
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
