/**
 * PKCE (Proof Key for Code Exchange) utilities
 * Implements RFC 7636 for secure OAuth2 flows
 */

const PKCE_VERIFIER_KEY = 'oauth_code_verifier';

export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function storeCodeVerifier(verifier: string): void {
  try {
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  } catch (error) {
    console.error('Failed to store code verifier:', error);
    throw new Error('Failed to store PKCE code verifier');
  }
}

export function getCodeVerifier(): string | null {
  try {
    return sessionStorage.getItem(PKCE_VERIFIER_KEY);
  } catch (error) {
    console.error('Failed to retrieve code verifier:', error);
    return null;
  }
}

export function clearPKCEData(): void {
  try {
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  } catch (error) {
    console.error('Failed to clear PKCE data:', error);
  }
}

