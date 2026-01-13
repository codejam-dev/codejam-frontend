/**
 * Detects if the user is on a Mac platform
 * Uses userAgent instead of deprecated navigator.platform
 */
export const isMac = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
};

/**
 * Returns the appropriate command key symbol for the platform
 */
export const getCommandKey = (): string => {
  return isMac() ? '⌘' : 'Ctrl';
};
