'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GithubIcon, ChevronDown, LogOut, Code, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type NavMode = 'full' | 'compact' | 'hidden';

function modeForPath(pathname: string): NavMode {
  if (pathname.startsWith('/auth')) return 'hidden';
  if (pathname === '/playground') return 'compact';
  return 'full';
}

export default function AppNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { authState, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  const mode = modeForPath(pathname);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      hasAnimatedRef.current = sessionStorage.getItem('navbar-animated') === 'true';
    }
  }, []);

  useEffect(() => {
    if (mounted && !hasAnimatedRef.current) {
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('navbar-animated', 'true');
          hasAnimatedRef.current = true;
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  useEffect(() => {
    if (mounted && window.location.hash === '#features') {
      setTimeout(() => {
        const el = document.getElementById('features');
        if (el) {
          const offset = el.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: offset, behavior: 'smooth' });
          window.history.replaceState(null, '', window.location.pathname);
        }
      }, 100);
    }
  }, [mounted]);

  useEffect(() => {
    setShowUserDropdown(false);
  }, [pathname]);

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

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  const handleFeaturesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById('features');
    if (el) {
      const offset = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      router.push('/#features');
    }
  };

  if (mode === 'hidden') return null;

  const isCompact = mode === 'compact';
  const shouldAnimate = mounted && !hasAnimatedRef.current;

  const userDropdownMenu = (
    <AnimatePresence>
      {showUserDropdown && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className={`absolute right-0 mt-1 overflow-hidden rounded-lg border border-zinc-700/60 shadow-xl backdrop-blur-xl z-[10000] ${
            isCompact
              ? 'w-52 bg-zinc-900/98'
              : 'w-56 bg-gray-800/98'
          }`}
          style={isCompact ? undefined : { boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.15)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-zinc-700/50 px-3 py-2">
            <p className="truncate text-xs font-medium text-white">{authState.user?.name}</p>
            <p className="truncate text-[10px] text-zinc-400">{authState.user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => { router.push('/playground'); setShowUserDropdown(false); }}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-zinc-300 hover:text-white transition-colors ${
              isCompact ? 'text-xs hover:bg-zinc-800/60' : 'gap-3 px-4 py-3 text-sm hover:bg-gray-700/50'
            }`}
          >
            <Code className={isCompact ? 'h-3.5 w-3.5' : 'w-4 h-4'} />
            Playground
          </button>
          <button
            type="button"
            onClick={() => { router.push('/dashboard'); setShowUserDropdown(false); }}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-zinc-300 hover:text-white transition-colors ${
              isCompact ? 'text-xs hover:bg-zinc-800/60' : 'gap-3 px-4 py-3 text-sm hover:bg-gray-700/50'
            }`}
          >
            <LayoutDashboard className={isCompact ? 'h-3.5 w-3.5' : 'w-4 h-4'} />
            Dashboard
          </button>
          <div className="border-t border-zinc-700/50" />
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-red-400 transition-colors ${
              isCompact ? 'text-xs hover:bg-red-500/10' : 'gap-3 px-4 py-3 text-sm hover:bg-red-500/10 hover:text-red-300'
            }`}
          >
            <LogOut className={isCompact ? 'h-3.5 w-3.5' : 'w-4 h-4'} />
            Logout
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.nav
      layout
      initial={shouldAnimate && !isCompact ? { y: -100, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={
        shouldAnimate && !isCompact
          ? { duration: 0.5, layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
          : { duration: 0, layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
      }
      className={`z-[100] border-b border-white/10 backdrop-blur-lg ${
        isCompact
          ? 'flex h-10 shrink-0 items-center justify-between bg-[#0a0a0f]/95 px-4'
          : 'sticky top-0 px-6 py-4 bg-[#0a0a0f]/80'
      }`}
    >
      <div className={isCompact
        ? 'flex w-full items-center justify-between'
        : 'max-w-7xl mx-auto relative flex justify-between items-center'
      }>
        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <motion.div
            layoutId="nav-logo"
            onClick={handleHomeClick}
            className={`font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent cursor-pointer ${
              isCompact ? 'text-sm' : 'text-2xl'
            }`}
            transition={{ layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
            whileHover={{ scale: isCompact ? 1.0 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CodeJam
          </motion.div>

          <AnimatePresence mode="wait">
            {isCompact && (
              <motion.span
                key="playground-label"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-medium text-zinc-500"
              >
                Playground
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Center links (full mode only, desktop) */}
        <AnimatePresence>
          {!isCompact && (
            <motion.div
              key="center-links"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden md:flex gap-8 items-center absolute left-1/2 transform -translate-x-1/2 z-10"
            >
              <motion.a
                href="#features"
                onClick={handleFeaturesClick}
                className="text-gray-400 hover:text-white transition text-sm font-medium cursor-pointer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Features
              </motion.a>
              <motion.button
                onClick={() => router.push('/playground')}
                className="text-gray-400 hover:text-white transition text-sm font-medium"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Playground
              </motion.button>
              <motion.a
                href="https://github.com/codejam-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <GithubIcon className="w-5 h-5" />
              </motion.a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right: Auth Section */}
        <div className="flex items-center gap-2 z-10">
          {authState.isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center gap-2 transition-colors ${
                  isCompact
                    ? 'rounded-lg px-2 py-1 hover:bg-zinc-800/50'
                    : 'gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-800/30 group'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {!isCompact && (
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500 rounded-full blur-sm opacity-0 group-hover:opacity-60 transition-opacity" />
                )}
                <motion.div
                  layoutId="nav-avatar"
                  className={`rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-lg ${
                    isCompact ? 'h-7 w-7 text-xs' : 'relative h-9 w-9 text-sm'
                  }`}
                  transition={{ layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
                >
                  {authState.user?.name?.charAt(0).toUpperCase() || 'U'}
                </motion.div>

                {!isCompact && (
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-white leading-tight">
                      {authState.user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <span className="text-xs text-gray-400 leading-tight">
                      {authState.user?.name?.split(' ').slice(1).join(' ') || ''}
                    </span>
                  </div>
                )}

                <ChevronDown
                  className={`text-zinc-400 transition-transform duration-200 ${
                    showUserDropdown ? 'rotate-180' : ''
                  } ${isCompact ? 'h-3.5 w-3.5' : 'w-4 h-4'}`}
                />
              </motion.button>

              {userDropdownMenu}
            </div>
          ) : (
            <>
              <motion.button
                type="button"
                onClick={() => router.push('/auth/login')}
                className={`font-medium text-zinc-300 hover:text-white transition ${
                  isCompact
                    ? 'rounded-md px-3 py-1 text-xs hover:bg-zinc-800/50'
                    : 'px-4 py-2 text-sm rounded-lg hover:bg-gray-800/30'
                }`}
                whileHover={{ scale: isCompact ? 1.02 : 1.05, y: isCompact ? 0 : -1 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
              <motion.button
                layoutId="nav-signup"
                type="button"
                onClick={() => router.push('/auth/register')}
                className={`bg-gradient-to-r from-violet-600 to-pink-600 font-semibold text-white cursor-pointer ${
                  isCompact
                    ? 'rounded-md px-3 py-1 text-xs shadow-md shadow-violet-500/20'
                    : 'px-6 py-2 rounded-lg shadow-lg shadow-violet-500/20'
                }`}
                transition={{ layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
                whileHover={{ scale: isCompact ? 1.02 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
