import { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS } from './config';
import { BaseResponse } from '@/types/auth.types';

export class ApiError extends Error {
  constructor(
    public message: string,
    public errorCode?: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type RequestCredentialsMode = RequestCredentials;

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;

    const authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (authToken) {
      const trimmed = authToken.trim();
      return trimmed.startsWith('Bearer ') ? trimmed.substring(7).trim() : trimmed;
    }

    const tempToken = localStorage.getItem(STORAGE_KEYS.TEMP_TOKEN);
    if (tempToken) {
      const trimmed = tempToken.trim();
      return trimmed.startsWith('Bearer ') ? trimmed.substring(7).trim() : trimmed;
    }

    return null;
  }

  private static getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        const cleanToken = token.trim();
        headers['Authorization'] = `Bearer ${cleanToken}`;
      }
    }

    return headers;
  }

  /**
   * Uses HttpOnly refresh cookie; stores new access token in localStorage on success.
   */
  static async trySilentRefresh(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data: BaseResponse<{ accessToken?: string }> = await response.json();
      if (!response.ok || !data.success || !data.data?.accessToken) {
        return false;
      }
      const access = data.data.accessToken.trim().replace(/^Bearer\s+/i, '');
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access);
      return true;
    } catch {
      return false;
    }
  }

  static async request<T = any>(
    url: string,
    options: RequestInit = {},
    includeAuth: boolean = false,
    retriedAfterRefresh: boolean = false,
    credentials: RequestCredentialsMode = 'omit'
  ): Promise<BaseResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...options,
        credentials,
        headers: {
          ...this.getHeaders(includeAuth),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: BaseResponse<T> = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401 && includeAuth && !retriedAfterRefresh) {
          const refreshed = await this.trySilentRefresh();
          if (refreshed) {
            return this.request<T>(url, options, includeAuth, true, credentials);
          }
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.TEMP_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            window.location.href = '/auth/login?expired=true';
          }
        }
        throw new ApiError(
          data.message || 'An error occurred',
          data.errorCode,
          response.status,
          data.data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 'TIMEOUT_ERROR', 408);
        }
        throw new ApiError(error.message, 'NETWORK_ERROR');
      }

      throw new ApiError('An unknown error occurred', 'UNKNOWN_ERROR');
    }
  }

  static async get<T = any>(url: string, includeAuth: boolean = false): Promise<BaseResponse<T>> {
    return this.request<T>(url, { method: 'GET' }, includeAuth, false, 'omit');
  }

  static async post<T = any>(
    url: string,
    body?: any,
    includeAuth: boolean = false,
    credentials: RequestCredentialsMode = 'omit'
  ): Promise<BaseResponse<T>> {
    return this.request<T>(
      url,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      includeAuth,
      false,
      credentials
    );
  }

  static async put<T = any>(
    url: string,
    body?: any,
    includeAuth: boolean = false
  ): Promise<BaseResponse<T>> {
    return this.request<T>(
      url,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      includeAuth,
      false,
      'omit'
    );
  }

  static async delete<T = any>(url: string, includeAuth: boolean = false): Promise<BaseResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' }, includeAuth, false, 'omit');
  }
}
