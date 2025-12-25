'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/services/auth.service';
import { ApiError } from '@/lib/api-client';

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
  generateOtp: () => Promise<void>;
  validateOtp: (otp: string) => Promise<void>;
  exchangeOAuthCode: (code: string) => Promise<void>;
  initiateGoogleLogin: () => void;
  clearError: () => void;
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

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = () => {
      const token = AuthService.getToken();
      const user = AuthService.getUser();
      const isAuthenticated = AuthService.isAuthenticated();

      setAuthState({
        isAuthenticated,
        user: isAuthenticated ? user : null,
        token: isAuthenticated ? token : null,
        loading: false,
        error: null,
      });
    };

    initAuth();
  }, []);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await AuthService.login({ email, password });

      if (response.success && response.data) {
        // Handle both 'isEnabled' and 'enabled' from backend
        const isEnabled = response.data.isEnabled !== undefined 
          ? response.data.isEnabled 
          : ((response.data as any).enabled ?? false);

        const user: User = {
          userId: response.data.userId,
          name: response.data.name,
          email: response.data.email,
          isEnabled: isEnabled,
        };

        // Only set authenticated if user is enabled
        if (isEnabled) {
          setAuthState({
            isAuthenticated: true,
            user,
            token: response.data.token,
            loading: false,
            error: null,
          });
        } else {
          // User not enabled - temp token stored, will redirect to verify-otp
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
        // Handle both 'isEnabled' and 'enabled' from backend
        const isEnabled = response.data.isEnabled !== undefined 
          ? response.data.isEnabled 
          : ((response.data as any).enabled ?? true);

        const user: User = {
          userId: response.data.userId,
          name: response.data.name,
          email: response.data.email,
          isEnabled: isEnabled,
        };

        setAuthState({
          isAuthenticated: true,
          user,
          token: response.data.token,
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
          userId: response.data.userId,
          name: response.data.name,
          email: response.data.email,
          isEnabled: true,
        };

        setAuthState({
          isAuthenticated: true,
          user,
          token: response.data.token,
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
      // Always update state even if logout API fails
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

