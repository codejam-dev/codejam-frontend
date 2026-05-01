'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { consumeAuthReturnTo } from '@/lib/auth-return-to';
import { AuthService } from '@/services/auth.service';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
      const returnTo = consumeAuthReturnTo();
      router.push(returnTo ?? '/playground');
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
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            We've sent a 6-digit code to
          </p>
          <p className="text-center text-sm font-medium text-violet-400">{email}</p>
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
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border border-zinc-700/60 bg-zinc-800/80 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50"
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={authState.loading || otp.join('').length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] focus:ring-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {authState.loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm font-medium text-violet-400 hover:text-violet-300"
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
            <Link href="/auth/register" className="font-medium text-violet-400 hover:text-violet-300">
              ← Back to Registration
            </Link>
          </div>
        </form>
        </div>
        <p className="mt-8 text-center text-xs text-zinc-600">© {new Date().getFullYear()} CodeJam</p>
      </div>
    </div>
  );
}
