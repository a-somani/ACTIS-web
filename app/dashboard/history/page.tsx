import { CreateHistoryPage } from '@/components/dashboard/history/create-history-page';
import { listCreateGenerations } from '@/utils/create-generations-server';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const records = user ? await listCreateGenerations(user.id) : [];

  return <CreateHistoryPage records={records} />;
}
