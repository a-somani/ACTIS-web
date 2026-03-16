'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

interface FormData {
  email: string;
  password: string;
}
export async function login(data: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const redirectBaseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${redirectBaseUrl}/auth/callback`,
    },
  });
  if (data.url) {
    return { url: data.url };
  }

  return { error: 'Unable to start Google login.' };
}

export async function resetPassword(email: string) {
  const supabase = await createClient();
  const redirectBaseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${redirectBaseUrl}/auth/callback?next=/dashboard`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function loginAnonymously() {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Guest login is only enabled in development.' };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInAnonymously();
  const { error: updateUserError } = await supabase.auth.updateUser({
    email: `aeroedit+${Date.now().toString(36)}@paddle.com`,
  });

  if (signInError || updateUserError) {
    return { error: signInError?.message ?? updateUserError?.message ?? 'Something went wrong' };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
