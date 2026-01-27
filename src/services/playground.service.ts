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
} from '@/types/playground.types';

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

      // Get auth token - use provided token or try to get from localStorage
      const authToken = token !== undefined ? token : this.getAuthToken();
      
      // Check if token exists and is not expired
      if (!authToken) {
        return {
          stdout: '',
          stderr: 'Authentication required. Please log in to execute code.',
          exitCode: 1,
          executionTime: 0,
          error: 'Authentication required',
        };
      }

      // Check if token is expired
      if (this.isTokenExpired(authToken)) {
        return {
          stdout: '',
          stderr: 'Your session has expired. Please log in again.',
          exitCode: 1,
          executionTime: 0,
          error: 'Token expired',
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
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        
        // Handle 401 specifically
        if (response.status === 401) {
          return {
            stdout: '',
            stderr: 'Authentication failed. Please log in again.',
            exitCode: 1,
            executionTime: 0,
            error: 'Authentication failed',
          };
        }
        
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
   * Clear all saved playground data
   */
  static clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PLAYGROUND_CODE);
      localStorage.removeItem(STORAGE_KEYS.PLAYGROUND_LANGUAGE);
      localStorage.removeItem(STORAGE_KEYS.PLAYGROUND_SETTINGS);
    } catch (error) {
      console.error('Failed to clear playground data:', error);
    }
  }
}
