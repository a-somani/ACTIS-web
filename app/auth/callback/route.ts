import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { log } from '@/utils/logger';
import { resolveServerSiteUrl } from '@/utils/server-site-url';

function normalizeNextPath(nextPath: string | null): string {
  if (nextPath?.startsWith('/') && !nextPath.startsWith('//')) {
    return nextPath;
  }

  return '/dashboard';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const safeNextPath = normalizeNextPath(searchParams.get('next'));
  const redirectBaseUrl = await resolveServerSiteUrl();

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNextPath, redirectBaseUrl));
    }

    log.warn('Google OAuth callback failed', {
      action: 'authCallback',
      reason: error.message,
      next: safeNextPath,
    });
  } else {
    log.warn('Google OAuth callback missing code', { action: 'authCallback', next: safeNextPath });
  }

  return NextResponse.redirect(new URL('/auth/auth-code-error', redirectBaseUrl));
}
