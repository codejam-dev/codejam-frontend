'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Menu,
  X,
  Moon,
  Sun,
  History,
  FileCode,
  Settings,
  Download,
  Share2,
} from 'lucide-react';
import { SupportedLanguage } from '@/types/playground.types';
import { LANGUAGE_TEMPLATES, SUPPORTED_LANGUAGES } from '@/lib/language-templates';

interface MobileHeaderProps {
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  fileName: string;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onOpenHistory: () => void;
}

export default function MobileHeader({
  language,
  onLanguageChange,
  fileName,
  isDarkTheme,
  onToggleTheme,
  onOpenHistory,
}: MobileHeaderProps) {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = LANGUAGE_TEMPLATES[language];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown]);

  return (
    <motion.div
      className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 border-b border-gray-700/50 backdrop-blur-xl z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Left: Language Selector */}
      <div className="relative flex-1" ref={dropdownRef}>
        <motion.button
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800/60 border border-gray-600/50 rounded-lg transition-all"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-700/50">
            {typeof currentLanguage.icon === 'function' ? (
              <currentLanguage.icon className="w-4 h-4" style={{ color: currentLanguage.iconColor }} />
            ) : (
              <span className="text-sm">{currentLanguage.icon}</span>
            )}
          </div>
          <span className="font-medium text-sm text-white">{currentLanguage.name}</span>
          <ChevronDown 
            className="w-4 h-4 text-gray-400 transition-transform" 
            style={{ transform: showLanguageDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} 
          />
        </motion.button>

        <AnimatePresence>
          {showLanguageDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-56 bg-gray-800/98 backdrop-blur-xl border border-gray-700/60 rounded-xl shadow-2xl overflow-hidden z-[100000]"
              style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)' }}
            >
              <div className="py-1 max-h-80 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const langConfig = LANGUAGE_TEMPLATES[lang];
                  const isActive = language === lang;
                  return (
                    <button
                      key={lang}
                      onClick={() => {
                        onLanguageChange(lang);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-violet-400'
                          : 'text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700/30">
                        {typeof langConfig.icon === 'function' ? (
                          <langConfig.icon className="w-5 h-5" style={{ color: langConfig.iconColor }} />
                        ) : (
                          <span className="text-lg">{langConfig.icon}</span>
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">{langConfig.name}</span>
                        <span className="text-xs text-gray-500">{langConfig.extension}</span>
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto w-2 h-2 rounded-full bg-violet-500"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Center: File name (compact) */}
      <div className="hidden xs:flex items-center gap-1.5 px-2 py-1 bg-gray-800/40 rounded border border-gray-700/30 mx-2">
        <FileCode className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-xs text-gray-400 max-w-20 truncate">{fileName}</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <motion.button
          onClick={onOpenHistory}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          title="Run history"
        >
          <History className="w-4.5 h-4.5 text-gray-400" />
        </motion.button>

        <motion.button
          onClick={onToggleTheme}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          {isDarkTheme ? (
            <Sun className="w-4.5 h-4.5 text-yellow-400" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-violet-400" />
          )}
        </motion.button>

        <motion.button
          onClick={() => setShowMenu(!showMenu)}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          {showMenu ? (
            <X className="w-4.5 h-4.5 text-gray-400" />
          ) : (
            <Menu className="w-4.5 h-4.5 text-gray-400" />
          )}
        </motion.button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-48 bg-gray-800/98 backdrop-blur-xl border border-gray-700/60 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              <div className="py-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
