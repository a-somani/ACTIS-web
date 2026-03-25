import { HomePage } from '@/components/home/home-page';
import { syncCreditsForUser } from '@/utils/credits-server';
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialCredits = user ? await syncCreditsForUser(user) : null;

  return <HomePage initialCredits={initialCredits} initialIsAuthenticated={Boolean(user)} />;
}
