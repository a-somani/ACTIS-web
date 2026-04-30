import { UpscaleWorkbench } from '@/components/dashboard/image-upscaler/upscale-workbench';
import { syncCreditsForUser } from '@/utils/credits-server';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardUpscalePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialCredits = user ? await syncCreditsForUser(user) : null;

  return (
    <main className="mx-auto w-full max-w-[1600px] p-3 md:p-6">
      <UpscaleWorkbench initialCredits={initialCredits} />
    </main>
  );
}
