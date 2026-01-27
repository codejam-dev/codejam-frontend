'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GithubIcon, ChevronDown, LogOut, Code, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { authState, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  // Check if NavBar has already animated in this session (only on client)
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      hasAnimatedRef.current = sessionStorage.getItem('navbar-animated') === 'true';
    }
  }, []);

  // Mark as animated after first animation completes
  useEffect(() => {
    if (mounted && !hasAnimatedRef.current) {
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('navbar-animated', 'true');
          hasAnimatedRef.current = true;
        }
      }, 500); // After animation completes
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  // Handle hash navigation on mount
  useEffect(() => {
    if (mounted && window.location.hash === '#features') {
      setTimeout(() => {
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
          const navbarHeight = 80;
          const elementPosition = featuresSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Remove hash immediately
          window.history.replaceState(null, '', window.location.pathname);
        }
      }, 100);
    }
  }, [mounted]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      // Get the position of the features section
      const navbarHeight = 80; // Approximate navbar height
      const elementPosition = featuresSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      // Smooth scroll to position
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Remove hash from URL to allow normal scroll behavior
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      // If not on home page, navigate to home with hash
      router.push('/#features');
    }
  };

  // Determine if we should animate (only after mount and if not animated before)
  const shouldAnimate = mounted && !hasAnimatedRef.current;

  return (
    <motion.nav
      initial={shouldAnimate ? { y: -100, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={shouldAnimate ? { duration: 0.5 } : { duration: 0 }}
      className="sticky top-0 z-[100] px-6 py-4 backdrop-blur-lg border-b border-white/10 bg-[#0a0a0f]/80"
    >
      <div className="max-w-7xl mx-auto relative flex justify-between items-center">
        {/* Left Corner: Logo */}
        <motion.div
          onClick={handleHomeClick}
          className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent cursor-pointer z-10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          CodeJam
        </motion.div>

        {/* Center: Navigation Links (hidden on mobile) */}
        <div className="hidden md:flex gap-8 items-center absolute left-1/2 transform -translate-x-1/2 z-10">
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
        </div>

        {/* Right Corner: Auth Section */}
        <div className="flex items-center gap-3 z-10">
          {authState.isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-gray-800/30 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Avatar with gradient border effect */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500 rounded-full blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                    {authState.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                {/* User name with subtle styling */}
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-white leading-tight">
                    {authState.user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <span className="text-xs text-gray-400 leading-tight">
                    {authState.user?.name?.split(' ').slice(1).join(' ') || ''}
                  </span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`}
                />
              </motion.button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-gray-800/98 backdrop-blur-xl border border-gray-700/60 rounded-xl shadow-2xl overflow-hidden z-[10000]"
                    style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.15)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-2">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-700/50">
                        <p className="text-sm font-semibold text-white">{authState.user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{authState.user?.email}</p>
                      </div>

                      {/* Menu Items */}
                      <button
                        onClick={() => {
                          router.push('/playground');
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                      >
                        <Code className="w-4 h-4" />
                        Playground
                      </button>

                      <button
                        onClick={() => {
                          router.push('/dashboard');
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </button>

                      <div className="border-t border-gray-700/50 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <motion.button
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition rounded-lg hover:bg-gray-800/30"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
              <motion.button
                onClick={() => router.push('/auth/register')}
                className="px-6 py-2 bg-gradient-to-r from-violet-600 to-pink-600 rounded-lg font-semibold cursor-pointer shadow-lg shadow-violet-500/20"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)"
                }}
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
