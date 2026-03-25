import { syncCreditsForUser } from '@/utils/credits-server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await syncCreditsForUser(user);
    return Response.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load credits.';
    return Response.json({ error: message }, { status: 500 });
  }
}
