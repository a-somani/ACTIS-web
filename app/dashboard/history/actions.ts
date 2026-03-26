'use server';

import { revalidatePath } from 'next/cache';
import { deleteCreateGenerationForUser } from '@/utils/create-generations-server';
import { validateUserSession } from '@/utils/supabase/server';

export async function deleteCreateGeneration(generationId: string) {
  try {
    const user = await validateUserSession();
    await deleteCreateGenerationForUser(user.id, generationId);
    revalidatePath('/dashboard/history');

    return { success: true } as const;
  } catch {
    return { error: 'Unable to delete this item right now.' } as const;
  }
}
