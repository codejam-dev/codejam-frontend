/**
 * Playground Service
 * Handles code execution and playground-related API calls
 */

import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/lib/config';
import {
  CodeExecutionRequest,
  CodeExecutionResponse,
  SupportedLanguage,
  EditorSettings,
  RunHistoryItem,
  ConsoleWorkspaceTab,
} from '@/types/playground.types';

const DEFAULT_CONSOLE_EXPANDED_HEIGHT_PX = 280;
const MIN_CONSOLE_EXPANDED_HEIGHT_PX = 120;
const MAX_CONSOLE_EXPANDED_HEIGHT_PX = 600;

function clampConsoleHeight(px: number): number {
  if (!Number.isFinite(px)) return DEFAULT_CONSOLE_EXPANDED_HEIGHT_PX;
  return Math.min(
    MAX_CONSOLE_EXPANDED_HEIGHT_PX,
    Math.max(MIN_CONSOLE_EXPANDED_HEIGHT_PX, Math.round(px))
  );
}

/** Public clamp for UI resize (same bounds as persisted height). */
export function clampConsoleExpandedHeight(px: number): number {
  return clampConsoleHeight(px);
}

function parseConsoleTab(raw: string | null): ConsoleWorkspaceTab {
  if (raw === 'stdout' || raw === 'stderr' || raw === 'console') return raw;
  return 'stdout';
}

export interface ConsoleWorkspaceUi {
  collapsed: boolean;
  expandedHeightPx: number;
  activeTab: ConsoleWorkspaceTab;
}

export class PlaygroundService {
  /**
   * Execute code in the playground
   * @param request - Code execution request
   * @param token - Optional auth token (if not provided, will try to get from localStorage)
   */
  static async executeCode(
    request: CodeExecutionRequest,
    token?: string | null
  ): Promise<CodeExecutionResponse> {
    try {
      // Map frontend language to backend enum format
      const languageMap: Record<SupportedLanguage, string> = {
        javascript: 'JAVASCRIPT',
        python: 'PYTHON',
        java: 'JAVA',
        cpp: 'CPP',
        c: 'C',
        go: 'GO',
        rust: 'RUST',
      };

      // Prepare backend request
      const backendRequest = {
        roomId: 'playground', // Default room ID for playground
        language: languageMap[request.language] || 'JAVASCRIPT',
        code: request.code,
      };

      let authToken = token !== undefined ? token : await this.ensureFreshAccessToken();

      if (!authToken || this.isTokenExpired(authToken)) {
        this.handleSessionExpired();
        return {
          stdout: '',
          stderr: '',
          exitCode: 0,
          executionTime: 0,
        };
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      };

      // Call the execution API
      const response = await fetch(API_ENDPOINTS.PLAYGROUND.EXECUTE, {
        method: 'POST',
        headers,
        body: JSON.stringify(backendRequest),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const recovered = await ApiClient.trySilentRefresh();
          if (recovered) {
            const retryToken = this.getAuthToken();
            if (retryToken && !this.isTokenExpired(retryToken)) {
              const retry = await fetch(API_ENDPOINTS.PLAYGROUND.EXECUTE, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${retryToken}`,
                },
                body: JSON.stringify(backendRequest),
              });
              if (retry.ok) {
                const result = await retry.json();
                return {
                  stdout: result.stdout || '',
                  stderr: result.stderr || result.errorMessage || '',
                  exitCode: result.exitCode ?? (result.status === 'SUCCESS' ? 0 : 1),
                  executionTime: result.executionTimeMs || 0,
                  error:
                    result.status === 'SYSTEM_ERROR' || result.status === 'TIMEOUT'
                      ? result.errorMessage || result.status
                      : undefined,
                };
              }
            }
          }
          this.handleSessionExpired();
          return {
            stdout: '',
            stderr: '',
            exitCode: 0,
            executionTime: 0,
          };
        }

        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Backend returns ExecutionResult directly (not wrapped)
      const result = await response.json();

      // Map backend response to frontend format
      return {
        stdout: result.stdout || '',
        stderr: result.stderr || result.errorMessage || '',
        exitCode: result.exitCode ?? (result.status === 'SUCCESS' ? 0 : 1),
        executionTime: result.executionTimeMs || 0,
        error: result.status === 'SYSTEM_ERROR' || result.status === 'TIMEOUT' 
          ? (result.errorMessage || result.status) 
          : undefined,
      };
    } catch (error: any) {
      // Return error response in the expected format
      return {
        stdout: '',
        stderr: error.message || 'Failed to execute code',
        exitCode: 1,
        executionTime: 0,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  /**
   * Get last 10 run history for the authenticated user
   */
  static async getRunHistory(token?: string | null): Promise<RunHistoryItem[]> {
    let authToken = token !== undefined ? token : await this.ensureFreshAccessToken();
    if (!authToken || this.isTokenExpired(authToken)) {
      this.handleSessionExpired();
      return [];
    }
    try {
      const response = await fetch(API_ENDPOINTS.PLAYGROUND.HISTORY, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.status === 401) {
        const recovered = await ApiClient.trySilentRefresh();
        if (recovered) {
          const retryToken = this.getAuthToken();
          if (retryToken && !this.isTokenExpired(retryToken)) {
            const retry = await fetch(API_ENDPOINTS.PLAYGROUND.HISTORY, {
              method: 'GET',
              headers: { Authorization: `Bearer ${retryToken}` },
            });
            if (retry.ok) {
              const data = await retry.json();
              if (Array.isArray(data)) return data;
              if (data && Array.isArray(data.runHistory)) return data.runHistory;
            }
          }
        }
        this.handleSessionExpired();
        return [];
      }
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      // Backend returns RunHistoryResponse: { runHistory: RunHistoryItemDto[] }
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.runHistory)) {
        return data.runHistory;
      }
      return [];
    } catch {
      return [];
    }
  }

  private static async ensureFreshAccessToken(): Promise<string | null> {
    let authToken = this.getAuthToken();
    if (authToken && !this.isTokenExpired(authToken)) {
      return authToken;
    }
    const ok = await ApiClient.trySilentRefresh();
    if (ok) {
      authToken = this.getAuthToken();
      if (authToken && !this.isTokenExpired(authToken)) {
        return authToken;
      }
    }
    return null;
  }

  /**
   * Get authentication token from localStorage
   */
  private static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Check for full auth token
    const authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (authToken) {
      const trimmed = authToken.trim();
      // Remove "Bearer " prefix if accidentally stored
      return trimmed.startsWith('Bearer ') ? trimmed.substring(7).trim() : trimmed;
    }

    // Fall back to temp token (for OTP flow)
    const tempToken = localStorage.getItem(STORAGE_KEYS.TEMP_TOKEN);
    if (tempToken) {
      const trimmed = tempToken.trim();
      return trimmed.startsWith('Bearer ') ? trimmed.substring(7).trim() : trimmed;
    }

    return null;
  }

  /**
   * Check if token is expired
   */
  private static isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;

      if (!exp) return true;

      // Check if token is expired (with 5 second buffer)
      return exp * 1000 < Date.now() - 5000;
    } catch {
      return true;
    }
  }

  /**
   * Handle session expiry - clear tokens and redirect to login
   */
  private static handleSessionExpired(): void {
    if (typeof window === 'undefined') return;

    // Clear all auth tokens
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TEMP_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);

    // Redirect to login with expired flag
    window.location.href = '/auth/login?expired=true';
  }

  /**
   * Mock code execution for testing (TEMPORARY)
   * Remove this when backend is implemented
   */
  private static async mockExecuteCode(
    request: CodeExecutionRequest
  ): Promise<CodeExecutionResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Mock successful execution for most cases
    const mockOutputs: Record<SupportedLanguage, string> = {
      javascript: 'Hello, CodeJam!\nFibonacci(10): 55',
      python: 'Hello, CodeJam!\nFibonacci(10): 55\nSquares: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]',
      java: 'Hello, CodeJam!\nFibonacci(10): 55',
      cpp: 'Hello, CodeJam!\nFibonacci(10): 55\nNumbers: 1 2 3 4 5',
      c: 'Hello, CodeJam!\nFibonacci(10): 55\nNumbers: 1 2 3 4 5',
      go: 'Hello, CodeJam!\nFibonacci(10): 55\nNumbers: [1 2 3 4 5]',
      rust: 'Hello, CodeJam!\nFibonacci(10): 55\nNumbers: [1, 2, 3, 4, 5]\nSum: 15',
    };

    // Check for common errors in code
    const hasError = request.code.includes('error') || request.code.includes('throw');
    const hasSyntaxError = request.code.trim().length === 0;

    if (hasSyntaxError) {
      return {
        stdout: '',
        stderr: 'SyntaxError: Unexpected end of input',
        exitCode: 1,
        executionTime: Math.floor(Math.random() * 100) + 50,
        error: 'Syntax error in code',
      };
    }

    if (hasError) {
      return {
        stdout: mockOutputs[request.language].split('\n')[0],
        stderr: 'Error: Something went wrong!\n    at Object.<anonymous> (code.js:5:7)',
        exitCode: 1,
        executionTime: Math.floor(Math.random() * 200) + 100,
      };
    }

    // Successful execution
    return {
      stdout: mockOutputs[request.language],
      stderr: '',
      exitCode: 0,
      executionTime: Math.floor(Math.random() * 500) + 200,
      memory: Math.random() * 10 + 5, // 5-15 MB
    };
  }

  /**
   * Save code to localStorage
   */
  static saveCode(language: SupportedLanguage, code: string): void {
    try {
      const savedCodes = this.getAllSavedCode();
      savedCodes[language] = code;
      localStorage.setItem(
        STORAGE_KEYS.PLAYGROUND_CODE,
        JSON.stringify(savedCodes)
      );
    } catch (error) {
      console.error('Failed to save code to localStorage:', error);
    }
  }

  /**
   * Get saved code for a specific language
   */
  static getSavedCode(language: SupportedLanguage): string | null {
    try {
      const savedCodes = this.getAllSavedCode();
      return savedCodes[language] || null;
    } catch (error) {
      console.error('Failed to retrieve saved code:', error);
      return null;
    }
  }

  /**
   * Get all saved code
   */
  static getAllSavedCode(): Record<string, string> {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYGROUND_CODE);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to parse saved code:', error);
      return {};
    }
  }

  /**
   * Save current language preference
   */
  static saveLanguage(language: SupportedLanguage): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYGROUND_LANGUAGE, language);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }

  /**
   * Get saved language preference
   */
  static getSavedLanguage(): SupportedLanguage | null {
    try {
      return localStorage.getItem(
        STORAGE_KEYS.PLAYGROUND_LANGUAGE
      ) as SupportedLanguage | null;
    } catch (error) {
      console.error('Failed to retrieve language preference:', error);
      return null;
    }
  }

  /**
   * Save editor settings
   */
  static saveSettings(settings: EditorSettings): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PLAYGROUND_SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Failed to save editor settings:', error);
    }
  }

  /**
   * Get saved editor settings
   */
  static getSavedSettings(): EditorSettings | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYGROUND_SETTINGS);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to retrieve editor settings:', error);
      return null;
    }
  }

  /**
   * Bottom execution console workspace (desktop) — collapsed state, expanded height, active tab.
   */
  static getConsoleWorkspaceUi(): ConsoleWorkspaceUi | null {
    if (typeof window === 'undefined') return null;
    try {
      const collapsedRaw = localStorage.getItem(STORAGE_KEYS.PLAYGROUND_CONSOLE_COLLAPSED);
      const heightRaw = localStorage.getItem(STORAGE_KEYS.PLAYGROUND_CONSOLE_HEIGHT);
      const tabRaw = localStorage.getItem(STORAGE_KEYS.PLAYGROUND_CONSOLE_TAB);
      if (collapsedRaw === null && heightRaw === null && tabRaw === null) {
        return null;
      }
      const collapsed = collapsedRaw === 'true';
      const expandedHeightPx =
        heightRaw !== null
          ? clampConsoleHeight(parseFloat(heightRaw))
          : DEFAULT_CONSOLE_EXPANDED_HEIGHT_PX;
      const activeTab = parseConsoleTab(tabRaw);
      return { collapsed, expandedHeightPx, activeTab };
    } catch (error) {
      console.error('Failed to read console workspace UI:', error);
      return null;
    }
  }

  static saveConsoleCollapsed(collapsed: boolean): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PLAYGROUND_CONSOLE_COLLAPSED,
        collapsed ? 'true' : 'false'
      );
    } catch (error) {
      console.error('Failed to save console collapsed state:', error);
    }
  }

  static saveConsoleExpandedHeight(px: number): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PLAYGROUND_CONSOLE_HEIGHT,
        String(clampConsoleHeight(px))
      );
    } catch (error) {
      console.error('Failed to save console height:', error);
    }
  }

  static saveConsoleActiveTab(tab: ConsoleWorkspaceTab): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYGROUND_CONSOLE_TAB, tab);
    } catch (error) {
      console.error('Failed to save console tab:', error);
    }
  }

  /** When true, output panes scroll to the latest line as content updates; when false, scroll position stays manual. */
  static getOutputAutoScrollTail(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PLAYGROUND_OUTPUT_AUTOSCROLL);
      if (raw === null) return true;
      return raw === 'true';
    } catch (error) {
      console.error('Failed to read output auto-scroll preference:', error);
      return true;
    }
  }

  static saveOutputAutoScrollTail(enabled: boolean): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PLAYGROUND_OUTPUT_AUTOSCROLL,
        enabled ? 'true' : 'false'
      );
    } catch (error) {
      console.error('Failed to save output auto-scroll preference:', error);
    }
  }

  /**
   * Clear all saved playground data
   */
  static clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PLAYGROUND_CODE);
      localStorage.removeItem(STORAGE_KEYS.PLAYGROUND_LANGUAGE);
      localStorage.removeItem(STORAGE_KEYS.PLAYGROUND_SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.PLAYGROUND_CONSOLE_LAYOUT);
      localStorage.removeItem(STORAGE_KEYS.PLAYGROUND_CONSOLE_COLLAPSED);
      localStorage.removeItem(STORAGE_KEYS.PLAYGROUND_CONSOLE_HEIGHT);
      localStorage.removeItem(STORAGE_KEYS.PLAYGROUND_CONSOLE_TAB);
      localStorage.removeItem(STORAGE_KEYS.PLAYGROUND_OUTPUT_AUTOSCROLL);
    } catch (error) {
      console.error('Failed to clear playground data:', error);
    }
  }

  /**
   * Console layout preferences interface
   */
  static readonly DEFAULT_CONSOLE_LAYOUT: ConsoleLayoutPreferences = {
    isCollapsed: false,
    height: 280,
    activeTab: 'stdout',
  };

  /**
   * Save console layout preferences
   */
  static saveConsoleLayout(prefs: ConsoleLayoutPreferences): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PLAYGROUND_CONSOLE_LAYOUT,
        JSON.stringify(prefs)
      );
    } catch (error) {
      console.error('Failed to save console layout preferences:', error);
    }
  }

  /**
   * Get saved console layout preferences
   */
  static getSavedConsoleLayout(): ConsoleLayoutPreferences | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYGROUND_CONSOLE_LAYOUT);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Validate the parsed object has expected properties
      if (
        typeof parsed.isCollapsed === 'boolean' &&
        typeof parsed.height === 'number' &&
        typeof parsed.activeTab === 'string'
      ) {
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve console layout preferences:', error);
      return null;
    }
  }
}

/**
 * Console layout preferences type
 */
export interface ConsoleLayoutPreferences {
  isCollapsed: boolean;
  height: number;
  activeTab: 'stdout' | 'stderr' | 'console';
}
