import { CreateWorkbench } from '@/components/dashboard/create/create-workbench';
import { syncCreditsForUser } from '@/utils/credits-server';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardCreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialCredits = user ? await syncCreditsForUser(user) : null;

  return (
    <main className="mx-auto w-full max-w-[1600px] p-3 md:p-6">
      <CreateWorkbench initialCredits={initialCredits} />
    </main>
  );
}
