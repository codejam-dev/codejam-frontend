// Base API Response
export interface BaseResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
  timestamp: string;
}

// Auth Request Types
export interface LoginRequest {
  email: string;
  password: string;
  deviceId: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ValidateOtpRequest {
  otp: string;
  transactionId: string;
  deviceId: string;
  email?: string;
}

export interface OauthExchangeRequest {
  code: string;
  codeVerifier: string;
  deviceId: string;
}

// Auth Response Types
export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId?: string;
  name: string;
  email: string;
  avatar?: string;
  isEnabled: boolean;
  message: string;
}

export interface RegisterResponse {
  accessToken: string;
  tokenType: string;
  name: string;
  email: string;
  isEnabled: boolean;
  message: string;
}

export interface GenerateOtpResponse {
  email: string;
  message: string;
  transactionId: string;
}

/** OAuth exchange now returns same shape as password login (AuthResponse). */
export type OAuthCodeResponse = AuthResponse;

// Auth State Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  isEnabled: boolean;
}

// Auth Context Types
export interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  generateOtp: () => Promise<void>;
  validateOtp: (otp: string) => Promise<void>;
  exchangeOAuthCode: (code: string) => Promise<void>;
  initiateGoogleLogin: () => void;
  clearError: () => void;
}

// Error Types
export interface ApiError {
  success: false;
  message: string;
  errorCode?: string;
  data?: any;
}
