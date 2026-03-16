import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CRON_PROBE_SCHEMA = 'auth';
const CRON_PROBE_TABLE = 'users';

function isCronRequestAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return true;
  }

  const authorization = request.headers.get('authorization');
  return authorization === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      {
        error:
          'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: CRON_PROBE_SCHEMA,
    },
  });

  const { count, error } = await supabase
    .from(CRON_PROBE_TABLE)
    .select('id', { head: true, count: 'exact' })
    .limit(1);

  if (error) {
    return Response.json(
      {
        ok: false,
        error: `Supabase keepalive failed: ${error.message}`,
      },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    keepalive: {
      schema: CRON_PROBE_SCHEMA,
      table: CRON_PROBE_TABLE,
      userCount: count ?? null,
      timestamp: new Date().toISOString(),
    },
  });
}
