'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/auth/login' }: ProtectedRouteProps) {
  const router = useRouter();
  const { authState } = useAuth();

  useEffect(() => {
    if (!authState.loading) {
      if (!authState.isAuthenticated) {
        // Check if user has temp token (unverified user)
        const tempToken = AuthService.getTempToken();
        const pendingEmail = AuthService.getPendingEmail();
        
        if (tempToken && pendingEmail) {
          // User has temp token, redirect to OTP verification
          router.push('/auth/verify-otp');
        } else {
          // No auth, redirect to login
          router.push(redirectTo);
        }
      } else if (authState.user && !authState.user.isEnabled) {
        // User is authenticated but not enabled, redirect to OTP verification
        router.push('/auth/verify-otp');
      }
    }
  }, [authState.loading, authState.isAuthenticated, authState.user, router, redirectTo]);

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
