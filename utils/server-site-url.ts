import 'server-only';

import { headers } from 'next/headers';

export async function resolveServerSiteUrl(): Promise<string> {
  const requestHeaders = await headers();
  const explicitOrigin = requestHeaders.get('origin');

  if (explicitOrigin) {
    return explicitOrigin;
  }

  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  if (host) {
    const protocol = requestHeaders.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https');
    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';
}
