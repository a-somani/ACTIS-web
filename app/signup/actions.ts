'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { log } from '@/utils/logger';
import { resolveServerSiteUrl } from '@/utils/server-site-url';

interface FormData {
  email: string;
  password: string;
}

export async function signup(data: FormData, nextPath = '/dashboard') {
  const supabase = await createClient();
  const redirectBaseUrl = await resolveServerSiteUrl();
  const redirectUrl = new URL('/auth/callback', redirectBaseUrl);
  redirectUrl.searchParams.set('next', nextPath);
  const { data: signUpData, error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: redirectUrl.toString(),
    },
  });

  if (error) {
    log.warn('Signup failed', { action: 'signup', email: data.email, reason: error.message });
    return { error: error.message };
  }

  if (!signUpData.session) {
    log.info('Signup requires email confirmation', { action: 'signup', email: data.email });
    return { requiresEmailConfirmation: true };
  }

  log.info('Signup succeeded', { action: 'signup', email: data.email });
  revalidatePath('/', 'layout');
  return { success: true };
}
