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

export class AuthService {
  /**
   * Register a new user - Returns temp token
   */
  static async register(data: RegisterRequest): Promise<BaseResponse<RegisterResponse>> {
    const response = await ApiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);

    if (response.success && response.data) {
      // Store temp token for OTP verification
      this.saveTempToken(response.data.token);
      this.setPendingEmail(response.data.email);
    }

    return response;
  }

  /**
   * Generate OTP using temp token
   */
  static async generateOtp(): Promise<BaseResponse<GenerateOtpResponse>> {
    const tempToken = this.getTempToken();
    if (!tempToken) {
      throw new Error('No temp token found. Please register first.');
    }

    // Call API with temp token in Authorization header
    const response = await ApiClient.post<GenerateOtpResponse>(
      API_ENDPOINTS.AUTH.GENERATE_OTP,
      undefined,
      true  // Include auth (will use temp token)
    );

    if (response.success && response.data?.transactionId) {
      this.setPendingTransactionId(response.data.transactionId);
    }

    return response;
  }

  /**
   * Validate OTP and get full token
   */
  static async validateOtp(otp: string): Promise<BaseResponse<AuthResponse>> {
    const tempToken = this.getTempToken();
    const transactionId = this.getPendingTransactionId();

    if (!tempToken) {
      throw new Error('No temp token found. Please register first.');
    }

    if (!transactionId) {
      throw new Error('No transaction ID found. Please generate OTP first.');
    }

    // Call API with temp token in Authorization header
    const response = await ApiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.VALIDATE_OTP,
      { otp, transactionId },
      true  // Include auth (will use temp token)
    );

    if (response.success && response.data) {
      // Clear temp data and save full auth data
      this.clearTempData();
      this.saveAuthData(response.data);
    }

    return response;
  }

  /**
   * Login with email and password
   */
  static async login(data: LoginRequest): Promise<BaseResponse<AuthResponse>> {
    const response = await ApiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);

    if (response.success && response.data) {
      // If user is not enabled, store temp token and email for OTP verification
      if (!response.data.isEnabled) {
        this.saveTempToken(response.data.token);
        this.setPendingEmail(response.data.email);
      } else {
        // User is enabled, save full auth data
        this.saveAuthData(response.data);
      }
    }

    return response;
  }

  /**
   * Exchange OAuth code for token with PKCE code_verifier
   */
  static async exchangeOAuthCode(code: string): Promise<BaseResponse<OAuthCodeResponse>> {
    const { getCodeVerifier, clearPKCEData } = await import('@/lib/pkce');
    
    const codeVerifier = getCodeVerifier();
    if (!codeVerifier) {
      throw new Error('PKCE code verifier not found. Please initiate OAuth login again.');
    }

    const response = await ApiClient.post<OAuthCodeResponse>(
      API_ENDPOINTS.AUTH.OAUTH_EXCHANGE,
      { code, codeVerifier }
    );

    if (response.success && response.data) {
      this.saveAuthData(response.data);
      // Clear PKCE data after successful exchange
      clearPKCEData();
    }

    return response;
  }

  /**
   * Initiate Google OAuth login with PKCE
   */
  static async initiateGoogleLogin(): Promise<void> {
    if (typeof window === 'undefined') return;

    const { generateCodeVerifier, generateCodeChallenge, storeCodeVerifier } = await import('@/lib/pkce');
    
    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Store code verifier for later use during code exchange
    storeCodeVerifier(codeVerifier);
    
    // Build OAuth URL with PKCE parameters
    const url = new URL(OAUTH_CONFIG.GOOGLE_AUTH_URL);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    
    window.location.href = url.toString();
  }

  /**
   * Logout user
   */
  static logout(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TEMP_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.PENDING_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.PENDING_TRANSACTION_ID);
  }

  /**
   * Get stored token (prefers full token over temp token)
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;

    // First check for full token
    const fullToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (fullToken) return fullToken;

    // Fall back to temp token
    return localStorage.getItem(STORAGE_KEYS.TEMP_TOKEN);
  }

  /**
   * Get temp token only
   */
  static getTempToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.TEMP_TOKEN);
  }

  /**
   * Get stored user data
   */
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

  /**
   * Check if user is authenticated (has full token with enabled=true)
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return false;

    const user = this.getUser();
    if (!user || !user.isEnabled) return false;

    return !this.isTokenExpired(token);
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Get pending email for OTP verification
   */
  static getPendingEmail(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.PENDING_EMAIL);
  }

  /**
   * Get pending transaction ID
   */
  static getPendingTransactionId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.PENDING_TRANSACTION_ID);
  }

  /**
   * Save authentication data (full token)
   */
  private static saveAuthData(data: AuthResponse | OAuthCodeResponse | RegisterResponse): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);

    // Handle both 'isEnabled' and 'enabled' from backend
    const isEnabled = 'isEnabled' in data 
      ? data.isEnabled 
      : ('enabled' in data ? (data as any).enabled : true);

    const user: User = {
      userId: data.userId,
      name: data.name,
      email: data.email,
      isEnabled: isEnabled,
    };

    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  /**
   * Save temp token
   */
  private static saveTempToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TEMP_TOKEN, token);
  }

  /**
   * Set pending email for OTP flow
   */
  private static setPendingEmail(email: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PENDING_EMAIL, email);
  }

  /**
   * Set pending transaction ID
   */
  private static setPendingTransactionId(transactionId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PENDING_TRANSACTION_ID, transactionId);
  }

  /**
   * Clear temporary data after successful verification
   */
  private static clearTempData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.TEMP_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.PENDING_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.PENDING_TRANSACTION_ID);
  }

  /**
   * Check health of auth service
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await ApiClient.get(API_ENDPOINTS.AUTH.HEALTH);
      return response.success;
    } catch {
      return false;
    }
  }
}
