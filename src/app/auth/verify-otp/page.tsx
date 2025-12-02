'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/services/auth.service';
import Link from 'next/link';

export default function VerifyOtpPage() {
  const router = useRouter();
  const { validateOtp, generateOtp, authState, clearError } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpGeneratedRef = useRef(false);

  useEffect(() => {
    clearError();
    const pendingEmail = AuthService.getPendingEmail();
    const tempToken = AuthService.getTempToken();
    const transactionId = AuthService.getPendingTransactionId();
    
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      router.push('/auth/register');
      return;
    }

    // Auto-generate OTP if temp token exists and no transaction ID yet (only once)
    if (tempToken && !transactionId && !otpGeneratedRef.current) {
      otpGeneratedRef.current = true;
      generateOtp();
    }
  }, [router, clearError]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    clearError();

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      alert('Please enter a 6-digit OTP');
      return;
    }

    try {
      await validateOtp(otpCode);
      router.push('/dashboard');
    } catch (error) {
      console.error('OTP validation failed:', error);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await generateOtp();
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            We've sent a 6-digit code to
          </p>
          <p className="text-center text-sm font-medium text-blue-400">{email}</p>
        </div>

        {authState.error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded relative">
            {authState.error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter OTP Code
            </label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={authState.loading || otp.join('').length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {authState.loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Resend Code
              </button>
            ) : (
              <p className="text-sm text-gray-400">
                Resend code in {resendTimer}s
              </p>
            )}
          </div>

          <div className="text-center text-sm">
            <Link href="/auth/register" className="font-medium text-gray-400 hover:text-gray-300">
              ← Back to Registration
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
