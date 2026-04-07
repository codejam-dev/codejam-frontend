/**
 * Browser-oriented playground helpers (share links, download, clipboard).
 */

import type { SupportedLanguage } from '@/types/playground.types';

const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  'javascript',
  'python',
  'java',
  'cpp',
  'c',
  'go',
  'rust',
];

function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function downloadCodeAsFile(
  code: string,
  language: SupportedLanguage,
  fileName: string,
): void {
  if (typeof document === 'undefined') return;

  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function buildShareUrl(code: string, language: SupportedLanguage): string {
  if (typeof window === 'undefined') return '';

  const encoded = btoa(encodeURIComponent(code));
  return `${window.location.origin}/playground?lang=${language}&code=${encoded}`;
}

export function parseShareParams(
  searchParams: URLSearchParams,
): { language: SupportedLanguage; code: string } | null {
  const langParam = searchParams.get('lang');
  const codeParam = searchParams.get('code');

  if (langParam == null || codeParam == null || langParam === '' || codeParam === '') {
    return null;
  }

  if (!isSupportedLanguage(langParam)) {
    return null;
  }

  try {
    const code = decodeURIComponent(atob(codeParam));
    return { language: langParam, code };
  } catch {
    return null;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
