'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { exchangeOAuthCode } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage('OAuth authentication failed. Please try again.');
        setTimeout(() => {
          router.push('/auth/login?error=' + error);
        }, 2000);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
        return;
      }

      try {
        await exchangeOAuthCode(code);
        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err) {
        setStatus('error');
        setErrorMessage('Failed to complete OAuth login. Please try again.');
        setTimeout(() => {
          router.push('/auth/login?error=oauth_exchange_failed');
        }, 2000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, exchangeOAuthCode, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500"></div>
              <h2 className="mt-6 text-2xl font-bold text-white">
                Completing Sign In...
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Please wait while we sign you in
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-white">
                Success!
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Redirecting to dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-white">
                Authentication Failed
              </h2>
              <p className="mt-2 text-sm text-red-400">
                {errorMessage}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Redirecting to login page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
