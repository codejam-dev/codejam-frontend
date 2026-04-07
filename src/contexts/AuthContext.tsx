'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AuthService } from '@/services/auth.service';
import { ApiError } from '@/lib/api-client';
import { STORAGE_KEYS } from '@/lib/config';

// Types
export interface User {
  userId: string;
  name: string;
  email: string;
  isEnabled: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

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

const ACCESS_REFRESH_INTERVAL_MS = 14 * 60 * 1000;

function pickAccessToken(data: { accessToken?: string; token?: string }): string | undefined {
  return data.accessToken ?? data.token;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyStoredAuth = useCallback(() => {
    const token = AuthService.getToken();
    const user = AuthService.getUser();
    const fullToken = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : null;
    const isAuthenticated = AuthService.isAuthenticated();

    if (token && !isAuthenticated && AuthService.isTokenExpired(token)) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: 'Your session has expired. Please log in again.',
      });
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
      return;
    }

    setAuthState({
      isAuthenticated,
      user: isAuthenticated ? user : null,
      token: isAuthenticated ? fullToken : null,
      loading: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    void (async () => {
      const fullToken =
        typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : null;
      if (fullToken && AuthService.isTokenExpired(fullToken)) {
        const ok = await AuthService.refreshAccessToken();
        if (!ok && typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        }
      }
      applyStoredAuth();
    })();
  }, [applyStoredAuth]);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }
    refreshIntervalRef.current = setInterval(() => {
      void AuthService.refreshAccessToken();
    }, ACCESS_REFRESH_INTERVAL_MS);
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [authState.isAuthenticated]);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await AuthService.login({
        email,
        password,
        deviceId: AuthService.getOrCreateDeviceId(),
      });

      if (response.success && response.data) {
        const isEnabled =
          response.data.isEnabled !== undefined
            ? response.data.isEnabled
            : ((response.data as { enabled?: boolean }).enabled ?? false);

        const user: User = {
          userId: response.data.userId ?? '',
          name: response.data.name,
          email: response.data.email,
          isEnabled,
        };

        const access = pickAccessToken(response.data);
        if (isEnabled) {
          setAuthState({
            isAuthenticated: true,
            user,
            token: access ?? AuthService.getToken(),
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null,
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Login failed';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      await AuthService.register({ name, email, password });

      setAuthState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Registration failed';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const generateOtp = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      await AuthService.generateOtp();

      setAuthState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to generate OTP';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const validateOtp = useCallback(async (otp: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await AuthService.validateOtp(otp);

      if (response.success && response.data) {
        const isEnabled =
          response.data.isEnabled !== undefined
            ? response.data.isEnabled
            : ((response.data as { enabled?: boolean }).enabled ?? true);

        const user: User = {
          userId: response.data.userId ?? '',
          name: response.data.name,
          email: response.data.email,
          isEnabled,
        };

        const access = pickAccessToken(response.data);

        setAuthState({
          isAuthenticated: true,
          user,
          token: access ?? AuthService.getToken(),
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'OTP validation failed';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const exchangeOAuthCode = useCallback(async (code: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await AuthService.exchangeOAuthCode(code);

      if (response.success && response.data) {
        const user: User = {
          userId: response.data.userId ?? '',
          name: response.data.name,
          email: response.data.email,
          isEnabled: true,
        };

        const access = pickAccessToken(response.data);

        setAuthState({
          isAuthenticated: true,
          user,
          token: access ?? AuthService.getToken(),
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'OAuth authentication failed';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } finally {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await AuthService.logoutAll();
    } finally {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    }
  }, []);

  const initiateGoogleLogin = useCallback(async () => {
    await AuthService.initiateGoogleLogin();
  }, []);

  const value: AuthContextType = {
    authState,
    login,
    register,
    logout,
    logoutAll,
    generateOtp,
    validateOtp,
    exchangeOAuthCode,
    initiateGoogleLogin,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
