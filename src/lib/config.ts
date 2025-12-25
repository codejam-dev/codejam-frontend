// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080',
  AUTH_BASE_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8080/v1/api/auth',
  TIMEOUT: 30000, // 30 seconds
};

// OAuth Configuration
export const OAUTH_CONFIG = {
  CALLBACK_URL: process.env.NEXT_PUBLIC_OAUTH_CALLBACK_URL || 'http://localhost:3000/auth/callback',
  GOOGLE_AUTH_URL: `${API_CONFIG.AUTH_BASE_URL}/oauth2/authorization/google`,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'codejam_auth_token',
  TEMP_TOKEN: 'codejam_temp_token',
  USER_DATA: 'codejam_user_data',
  PENDING_EMAIL: 'codejam_pending_email',
  PENDING_TRANSACTION_ID: 'codejam_pending_transaction_id',
  PLAYGROUND_CODE: 'codejam_playground_code',
  PLAYGROUND_LANGUAGE: 'codejam_playground_language',
  PLAYGROUND_SETTINGS: 'codejam_playground_settings',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_CONFIG.AUTH_BASE_URL}/register`,
    LOGIN: `${API_CONFIG.AUTH_BASE_URL}/login`,
    LOGOUT: `${API_CONFIG.AUTH_BASE_URL}/logout`,
    GENERATE_OTP: `${API_CONFIG.AUTH_BASE_URL}/generateOtp`,
    VALIDATE_OTP: `${API_CONFIG.AUTH_BASE_URL}/validateOtp`,
    RESET_PASSWORD: `${API_CONFIG.AUTH_BASE_URL}/resetPassword`,
    VALIDATE_RESET_TOKEN: `${API_CONFIG.AUTH_BASE_URL}/validateResetToken`,
    OAUTH_EXCHANGE: `${API_CONFIG.AUTH_BASE_URL}/oauth/exchange`,
    HEALTH: `${API_CONFIG.AUTH_BASE_URL}/health`,
  },
  PLAYGROUND: {
    EXECUTE: `${API_CONFIG.BASE_URL}/api/playground/execute`,
  },
};
