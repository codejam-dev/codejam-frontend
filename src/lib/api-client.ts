import { API_CONFIG, STORAGE_KEYS } from './config';
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

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;

    // First check for full auth token
    const authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (authToken) return authToken;

    // Fall back to temp token (for OTP flow)
    return localStorage.getItem(STORAGE_KEYS.TEMP_TOKEN);
  }

  private static getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  static async request<T = any>(
    url: string,
    options: RequestInit = {},
    includeAuth: boolean = false
  ): Promise<BaseResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(includeAuth),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: BaseResponse<T> = await response.json();

      if (!response.ok || !data.success) {
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
    return this.request<T>(url, { method: 'GET' }, includeAuth);
  }

  static async post<T = any>(
    url: string,
    body?: any,
    includeAuth: boolean = false,
    customHeaders?: HeadersInit
  ): Promise<BaseResponse<T>> {
    return this.request<T>(
      url,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
        headers: customHeaders,
      },
      includeAuth
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
      includeAuth
    );
  }

  static async delete<T = any>(url: string, includeAuth: boolean = false): Promise<BaseResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' }, includeAuth);
  }
}
