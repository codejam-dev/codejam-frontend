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
      <div className="flex min-h-[80vh] items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-zinc-700 border-t-violet-500" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
