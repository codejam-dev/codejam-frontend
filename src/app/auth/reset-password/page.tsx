'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowLeft, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/config';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/\d/.test(password)) errors.push('One number');
    if (!/[@$!%*?&]/.test(password)) errors.push('One special character (@$!%*?&)');
    return errors;
  };

  useEffect(() => {
    // Extract token and email from URL
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (!tokenParam || !emailParam) {
      // No token or email in URL, redirect to forgot-password page
      router.push('/auth/forgot-password');
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation - same as register page
    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setError('Password does not meet requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.VALIDATE_RESET_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          resetToken: token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setIsSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if no token or email (will redirect)
  if (!token || !email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700"
      >
        {/* Back Button */}
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to forgot password
        </Link>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-full mb-4"
                >
                  <Shield className="w-8 h-8 text-violet-400" />
                </motion.div>
                <h2 className="text-3xl font-extrabold text-white">
                  Reset Your Password
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Enter your new password below
                </p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-start gap-2"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordErrors(validatePassword(e.target.value));
                        setError('');
                      }}
                      className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Enter new password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Confirm new password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-300 mb-2">Password must contain:</p>
                  <ul className="text-xs space-y-1">
                    {[
                      { text: 'At least 8 characters', valid: newPassword.length >= 8 },
                      { text: 'One uppercase letter', valid: /[A-Z]/.test(newPassword) },
                      { text: 'One lowercase letter', valid: /[a-z]/.test(newPassword) },
                      { text: 'One number', valid: /\d/.test(newPassword) },
                      { text: 'One special character (@$!%*?&)', valid: /[@$!%*?&]/.test(newPassword) },
                    ].map((req, idx) => (
                      <li key={idx} className={`flex items-center gap-2 ${req.valid ? 'text-green-400' : 'text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${req.valid ? 'bg-green-400' : 'bg-gray-500'}`} />
                        {req.text}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || passwordErrors.length > 0}
                  className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-gray-800/50 text-gray-400">
                    Remember your password?
                  </span>
                </div>
              </div>

              {/* Sign in link */}
              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Sign in instead
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-6 py-8"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full mb-4"
              >
                <CheckCircle className="w-10 h-10 text-green-400" />
              </motion.div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">Password Reset Successful!</h3>
                <p className="text-gray-400 max-w-sm mx-auto">
                  Your password has been successfully reset.
                  <span className="block text-violet-400 font-medium mt-1">You can now sign in with your new password.</span>
                </p>
              </div>

              <div className="pt-4">
                <div className="text-xs text-gray-500 mb-4">
                  Redirecting to login in a few seconds...
                </div>
                <Link
                  href="/auth/login"
                  className="inline-block text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Sign in now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Text */}
        {!isSuccess && (
          <div className="pt-6 border-t border-gray-700">
            <p className="text-xs text-center text-gray-500">
              Need help?{' '}
              <Link href="/support" className="text-violet-400 hover:text-violet-300">
                Contact support
              </Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
