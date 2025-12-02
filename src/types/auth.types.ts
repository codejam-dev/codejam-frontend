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
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ValidateOtpRequest {
  otp: string;
  transactionId: string;
  email?: string;
}

export interface OauthExchangeRequest {
  code: string;
  codeVerifier: string;
}

// Auth Response Types
export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  name: string;
  email: string;
  isEnabled: boolean;
  message: string;
}

export interface RegisterResponse {
  token: string;
  tokenType: string;
  userId: string;
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

export interface OAuthCodeResponse {
  token: string;
  tokenType: string;
  userId: string;
  email: string;
  name: string;
  provider: string;
  message: string;
}

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
  logout: () => void;
  generateOtp: (email: string) => Promise<void>;
  validateOtp: (email: string, otp: string) => Promise<void>;
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
