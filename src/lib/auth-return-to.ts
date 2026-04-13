/**
 * After login / OTP / OAuth, send the user back to the URL they tried to open (e.g. shared playground link).
 */

export const AUTH_RETURN_TO_KEY = 'returnTo';

function isSafeReturnPath(path: string): boolean {
  if (path.length === 0 || path.length > 2048) return false;
  if (!path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  return !/[\u0000-\u001F]/.test(path);
}

/** Store current location so we can restore it after auth (same-tab only). */
export function captureAuthReturnTo(): void {
  if (typeof window === 'undefined') return;
  const full =
    window.location.pathname + window.location.search + window.location.hash;
  if (!isSafeReturnPath(full)) return;
  sessionStorage.setItem(AUTH_RETURN_TO_KEY, full);
}

/** Read and clear stored return path; null if missing or unsafe. */
export function consumeAuthReturnTo(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(AUTH_RETURN_TO_KEY);
  sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
  if (raw && isSafeReturnPath(raw)) return raw;
  return null;
}
