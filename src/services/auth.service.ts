import { ApiClient } from '@/lib/api-client';
import { API_ENDPOINTS, OAUTH_CONFIG, STORAGE_KEYS } from '@/lib/config';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RegisterResponse,
  GenerateOtpResponse,
  OAuthCodeResponse,
  User,
  BaseResponse,
} from '@/types/auth.types';

function pickAccessToken(data: { accessToken?: string; token?: string } | undefined): string | null {
  if (!data) return null;
  const t = data.accessToken ?? (data as { token?: string }).token;
  return t ? String(t).trim() : null;
}

export class AuthService {
  static getOrCreateDeviceId(): string {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
    }
    return id;
  }

  static async register(data: RegisterRequest): Promise<BaseResponse<RegisterResponse>> {
    const response = await ApiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);

    if (response.success && response.data) {
      const access = pickAccessToken(response.data as { accessToken?: string; token?: string });
      if (access) {
        this.saveTempToken(access);
      }
      this.setPendingEmail(response.data.email);
    }

    return response;
  }

  static async generateOtp(): Promise<BaseResponse<GenerateOtpResponse>> {
    const tempToken = this.getTempToken();
    if (!tempToken) {
      throw new Error('No temp token found. Please register first.');
    }

    const response = await ApiClient.post<GenerateOtpResponse>(
      API_ENDPOINTS.AUTH.GENERATE_OTP,
      undefined,
      true
    );

    if (response.success && response.data?.transactionId) {
      this.setPendingTransactionId(response.data.transactionId);
    }

    return response;
  }

  static async validateOtp(otp: string): Promise<BaseResponse<AuthResponse>> {
    const tempToken = this.getTempToken();
    const transactionId = this.getPendingTransactionId();

    if (!tempToken) {
      throw new Error('No temp token found. Please register first.');
    }

    if (!transactionId) {
      throw new Error('No transaction ID found. Please generate OTP first.');
    }

    const response = await ApiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.VALIDATE_OTP,
      {
        otp,
        transactionId,
        deviceId: this.getOrCreateDeviceId(),
      },
      true,
      'include'
    );

    if (response.success && response.data) {
      this.clearTempData();
      this.saveAuthData(response.data);
    }

    return response;
  }

  static async login(data: LoginRequest): Promise<BaseResponse<AuthResponse>> {
    const payload: LoginRequest = {
      ...data,
      deviceId: data.deviceId || this.getOrCreateDeviceId(),
    };
    const response = await ApiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, payload, false, 'include');

    if (response.success && response.data) {
      const isEnabled =
        response.data.isEnabled !== undefined
          ? response.data.isEnabled
          : ((response.data as { enabled?: boolean }).enabled ?? false);

      if (!isEnabled) {
        const access = pickAccessToken(response.data as { accessToken?: string; token?: string });
        if (access) {
          this.saveTempToken(access);
        }
        this.setPendingEmail(response.data.email);
      } else {
        this.saveAuthData(response.data);
      }
    }

    return response;
  }

  static async exchangeOAuthCode(code: string): Promise<BaseResponse<OAuthCodeResponse>> {
    const { getCodeVerifier, clearPKCEData } = await import('@/lib/pkce');

    const codeVerifier = getCodeVerifier();
    if (!codeVerifier) {
      throw new Error('PKCE code verifier not found. Please initiate OAuth login again.');
    }

    const response = await ApiClient.post<OAuthCodeResponse>(
      API_ENDPOINTS.AUTH.OAUTH_EXCHANGE,
      {
        code,
        codeVerifier,
        deviceId: this.getOrCreateDeviceId(),
      },
      false,
      'include'
    );

    if (response.success && response.data) {
      this.saveAuthData(response.data);
      clearPKCEData();
    }

    return response;
  }

  static async initiateGoogleLogin(): Promise<void> {
    if (typeof window === 'undefined') return;

    const { generateCodeVerifier, generateCodeChallenge, storeCodeVerifier } = await import('@/lib/pkce');

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    storeCodeVerifier(codeVerifier);

    const url = new URL(OAUTH_CONFIG.GOOGLE_AUTH_URL);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');

    window.location.href = url.toString();
  }

  static async refreshAccessToken(): Promise<boolean> {
    return ApiClient.trySilentRefresh();
  }

  static async logout(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      await ApiClient.post(API_ENDPOINTS.AUTH.LOGOUT, undefined, false, 'include');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.TEMP_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.PENDING_EMAIL);
      localStorage.removeItem(STORAGE_KEYS.PENDING_TRANSACTION_ID);
    }
  }

  static async logoutAll(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      await ApiClient.post(API_ENDPOINTS.AUTH.LOGOUT_ALL, undefined, true, 'include');
    } catch (error) {
      console.error('Logout all API call failed:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.TEMP_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.PENDING_EMAIL);
      localStorage.removeItem(STORAGE_KEYS.PENDING_TRANSACTION_ID);
    }
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;

    const fullToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (fullToken) return fullToken;

    return localStorage.getItem(STORAGE_KEYS.TEMP_TOKEN);
  }

  static getTempToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.TEMP_TOKEN);
  }

  static getUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return false;

    const user = this.getUser();
    if (!user || !user.isEnabled) return false;

    return !this.isTokenExpired(token);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  static getPendingEmail(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.PENDING_EMAIL);
  }

  static getPendingTransactionId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.PENDING_TRANSACTION_ID);
  }

  private static saveAuthData(data: AuthResponse | OAuthCodeResponse | RegisterResponse): void {
    if (typeof window === 'undefined') return;

    const access = pickAccessToken(data as { accessToken?: string; token?: string });
    if (!access) return;

    const cleanToken = access.trim().replace(/^Bearer\s+/i, '');
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, cleanToken);

    const isEnabled =
      'isEnabled' in data ? data.isEnabled : ('enabled' in data ? (data as { enabled?: boolean }).enabled : true);

    const user: User = {
      userId: (data as AuthResponse).userId ?? '',
      name: data.name,
      email: data.email,
      isEnabled: isEnabled ?? true,
    };

    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  private static saveTempToken(token: string): void {
    if (typeof window === 'undefined') return;
    const cleanToken = token.trim().replace(/^Bearer\s+/i, '');
    localStorage.setItem(STORAGE_KEYS.TEMP_TOKEN, cleanToken);
  }

  private static setPendingEmail(email: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PENDING_EMAIL, email);
  }

  private static setPendingTransactionId(transactionId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PENDING_TRANSACTION_ID, transactionId);
  }

  private static clearTempData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.TEMP_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.PENDING_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.PENDING_TRANSACTION_ID);
  }

  static async checkHealth(): Promise<boolean> {
    try {
      const response = await ApiClient.get(API_ENDPOINTS.AUTH.HEALTH);
      return response.success;
    } catch {
      return false;
    }
  }
}
