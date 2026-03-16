'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/utils/supabase/server';

interface FormData {
  email: string;
  password: string;
}

export async function signup(data: FormData) {
  const supabase = await createClient();
  const redirectBaseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { data: signUpData, error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${redirectBaseUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!signUpData.session) {
    return { requiresEmailConfirmation: true };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
