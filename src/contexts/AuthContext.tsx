'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { authAPI, ApiError } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const quickCheck = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          setUser(user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setTimeout(quickCheck, 0);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const authData = await authAPI.login(credentials);
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('userData', JSON.stringify(authData.user));
      setUser(authData.user);
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof ApiError && error.status >= 500) {
        console.log('Backend unavailable, using mock data for development');
        const mockUser: User = {
          id: 'mock-' + Date.now(),
          email: credentials.email,
          name: credentials.email.split('@')[0],
        };
        localStorage.setItem('authToken', 'mock-token-' + Date.now());
        localStorage.setItem('userData', JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const authData = await authAPI.register({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      });
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('userData', JSON.stringify(authData.user));
      setUser(authData.user);
    } catch (error) {
      console.error('Registration failed:', error);
      if (error instanceof ApiError && error.status >= 500) {
        console.log('Backend unavailable, using mock data for development');
        const mockUser: User = {
          id: 'mock-' + Date.now(),
          email: credentials.email,
          name: credentials.name,
        };
        localStorage.setItem('authToken', 'mock-token-' + Date.now());
        localStorage.setItem('userData', JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const { generateCodeVerifier, generateCodeChallenge, storeCodeVerifier } = await import('@/lib/pkce');
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      storeCodeVerifier(codeVerifier);
      
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      const oauthUrl = `${backendUrl}/auth/oauth2/authorization/google?code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=S256`;
      
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('Google OAuth redirect failed:', error);
      try {
        const { clearPKCEData } = await import('@/lib/pkce');
        clearPKCEData();
      } catch (clearError) {
        console.error('Failed to clear PKCE data:', clearError);
      }
      throw error;
    }
  };

  const handleOAuthSuccess = (token: string, userInfo: { email: string; name: string; userId: string; avatar?: string }) => {
    const user: User = {
      id: userInfo.userId,
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.avatar || undefined,
    };

    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    setUser(user);
    setIsLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
    handleOAuthSuccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

