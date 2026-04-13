'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { consumeAuthReturnTo } from '@/lib/auth-return-to';
import { AuthService } from '@/services/auth.service';
import Link from 'next/link';
import { motion } from 'framer-motion';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, initiateGoogleLogin, authState, clearError } = useAuth();
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    clearError();

    if (!searchParams) return;

    // Check for session expiry redirect
    const expired = searchParams.get('expired');
    if (expired === 'true') {
      setUrlError('Your session has expired. Please log in again.');
      router.replace('/auth/login');
      return;
    }

    // Check for error parameters in URL (from OAuth failure redirect)
    const error = searchParams.get('error');
    const errorMessage = searchParams.get('errorMessage');

    if (errorMessage) {
      setUrlError(errorMessage);
      // Clear the error from URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('error');
      newSearchParams.delete('errorMessage');
      const newUrl = newSearchParams.toString()
        ? `${window.location.pathname}?${newSearchParams.toString()}`
        : window.location.pathname;
      router.replace(newUrl);
    } else if (error && error !== 'oauth_failed') {
      // Handle other error types
      setUrlError('Authentication failed. Please try again.');
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('error');
      const newUrl = newSearchParams.toString()
        ? `${window.location.pathname}?${newSearchParams.toString()}`
        : window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router, clearError]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);

      // Check if user has temp token (unverified user)
      const tempToken = AuthService.getTempToken();
      const pendingEmail = AuthService.getPendingEmail();

      if (tempToken && pendingEmail) {
        // User is not enabled, redirect to OTP verification
        router.push('/auth/verify-otp');
      } else {
        const returnTo = consumeAuthReturnTo();
        router.push(returnTo ?? '/playground');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleGoogleLogin = () => {
    initiateGoogleLogin();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] px-4 py-12">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-pink-900/20"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 100%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>
      <div className="relative z-0 w-full max-w-md">
        <div className="w-full space-y-8 p-8 bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <Link href="/" className="block text-center">
            <span className="text-sm font-semibold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent hover:from-violet-300 hover:to-pink-300">
              CodeJam
            </span>
          </Link>
          <div>
            <h2 className="text-center text-3xl font-extrabold text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Sign in to your CodeJam account
            </p>
          </div>

          {(authState.error || urlError) && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded relative">
              {urlError || authState.error}
            </div>
          )}

          {/* Google Login - Primary Option */}
          <div className="mt-8">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-zinc-700/60 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] focus:ring-violet-500/40 transition-colors shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </button>
          </div>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700/60"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-zinc-900 text-gray-400">Or sign in with email</span>
            </div>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-zinc-700/60 bg-zinc-800/80 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-zinc-700/60 bg-zinc-800/80 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-violet-400 hover:text-violet-300">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={authState.loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] focus:ring-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {authState.loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-400">Don't have an account?</span>{' '}
              <Link href="/auth/register" className="font-medium text-violet-400 hover:text-violet-300">
                Sign up
              </Link>
            </div>
          </form>
        </div>
        <p className="mt-8 text-center text-xs text-zinc-600">© {new Date().getFullYear()} CodeJam</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative z-0 text-white">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
