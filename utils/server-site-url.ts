import 'server-only';

import { headers } from 'next/headers';

function toAbsoluteUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function toUrlWithProtocol(host: string | null | undefined, protocol: string) {
  if (!host) {
    return null;
  }

  return toAbsoluteUrl(`${protocol}://${host}`);
}

export async function resolveServerSiteUrl(): Promise<string> {
  const configuredUrl = toAbsoluteUrl(process.env.NEXT_PUBLIC_SITE_URL?.trim()) ??
    toAbsoluteUrl(process.env.SITE_URL?.trim()) ??
    toAbsoluteUrl(
      process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
    ) ??
    toAbsoluteUrl(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (configuredUrl) {
    return configuredUrl;
  }

  const requestHeaders = await headers();
  const explicitOrigin = toAbsoluteUrl(requestHeaders.get('origin'));

  if (explicitOrigin) {
    return explicitOrigin;
  }

  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const forwardedProtocol = requestHeaders.get('x-forwarded-proto');
  const inferredProtocol = host?.includes('localhost') ? 'http' : 'https';
  const headerDerivedUrl = toUrlWithProtocol(host, forwardedProtocol ?? inferredProtocol);

  return headerDerivedUrl ?? 'http://localhost:3000';
}
