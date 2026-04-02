'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Code, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function PlaygroundNavBar() {
  const router = useRouter();
  const { authState, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown]);

  const handleLogout = async () => {
    await logout();
    setShowUserDropdown(false);
    router.push('/');
  };

  return (
    <header className="z-[100] flex h-10 shrink-0 items-center justify-between border-b border-white/10 bg-[#0a0a0f]/95 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-sm font-bold text-transparent hover:opacity-90"
        >
          CodeJam
        </button>
        <span className="text-xs font-medium text-zinc-500">Playground</span>
      </div>

      <div className="flex items-center gap-2">
        {authState.isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <motion.button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-zinc-800/50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-xs font-semibold text-white">
                {authState.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
              />
            </motion.button>

            <AnimatePresence>
              {showUserDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1 w-52 overflow-hidden rounded-lg border border-zinc-700/60 bg-zinc-900/98 shadow-xl backdrop-blur-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="border-b border-zinc-700/50 px-3 py-2">
                    <p className="truncate text-xs font-medium text-white">{authState.user?.name}</p>
                    <p className="truncate text-[10px] text-zinc-400">{authState.user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      router.push('/playground');
                      setShowUserDropdown(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800/60"
                  >
                    <Code className="h-3.5 w-3.5" />
                    Playground
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      router.push('/dashboard');
                      setShowUserDropdown(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800/60"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Dashboard
                  </button>
                  <div className="border-t border-zinc-700/50" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <motion.button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="rounded-md px-3 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Login
            </motion.button>
            <motion.button
              type="button"
              onClick={() => router.push('/auth/register')}
              className="rounded-md bg-gradient-to-r from-violet-600 to-pink-600 px-3 py-1 text-xs font-semibold text-white shadow-md shadow-violet-500/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign Up
            </motion.button>
          </>
        )}
      </div>
    </header>
  );
}
