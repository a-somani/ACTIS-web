export function resolveSiteUrl(path = ''): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredBaseUrl) {
    return new URL(path, ensureTrailingSlash(configuredBaseUrl)).toString();
  }

  if (typeof window !== 'undefined') {
    return new URL(path, ensureTrailingSlash(window.location.origin)).toString();
  }

  return path;
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}
