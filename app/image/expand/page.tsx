import { redirect } from 'next/navigation';
import { ImageModifierWorkbench } from '@/components/dashboard/image-modifier/image-modifier-workbench';
import { createClient } from '@/utils/supabase/server';

export default async function ImageExpandPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect('/login');
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Image Expand</h1>
      <ImageModifierWorkbench />
    </main>
  );
}
