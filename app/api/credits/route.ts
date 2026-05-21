import { syncCreditsForUser } from '@/utils/credits-server';
import { log } from '@/utils/logger';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const shouldSyncRecentCreditPacks = url.searchParams.get('trigger') === 'billing-success';

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      log.warn('Credits API unauthorized request', {
        route: 'GET /api/credits',
        trigger: url.searchParams.get('trigger') ?? null,
      });
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    log.info('Credits API request received', {
      route: 'GET /api/credits',
      userId: user.id,
      trigger: url.searchParams.get('trigger') ?? null,
      syncRecentCreditPacks: shouldSyncRecentCreditPacks,
    });

    const summary = await syncCreditsForUser(user, {
      syncRecentCreditPackTransactions: shouldSyncRecentCreditPacks,
    });

    log.info('Credits API request completed', {
      route: 'GET /api/credits',
      userId: user.id,
      balance: summary.balance,
      activeTierId: summary.activeTierId,
    });

    return Response.json(summary);
  } catch (error) {
    log.error('Credits API request failed', error, {
      route: 'GET /api/credits',
    });
    const message = error instanceof Error ? error.message : 'Unable to load credits.';
    return Response.json({ error: message }, { status: 500 });
  }
}
