/**
 * Returns the given redirect query value if it is an app-internal path, otherwise undefined.
 * Protects against open redirects via `?redirect=https://evil.example` or `//evil.example`.
 */
export function safeRedirectPath(redirect: unknown): string | undefined {
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect;
  }
  return undefined;
}
