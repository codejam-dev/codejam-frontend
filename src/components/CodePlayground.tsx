'use client';

import { useState, useEffect, useCallback } from 'react';
import Split from 'react-split';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Settings,
  Download,
  Share2,
  ChevronDown,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  FileCode,
  Users,
  Radio,
} from 'lucide-react';
import CodeEditor from './CodeEditor';
import OutputPanel from './OutputPanel';
import ExecutionMetrics from './ExecutionMetrics';
import {
  SupportedLanguage,
  CodeExecutionResponse,
  EditorSettings,
  EditorStats,
  PlaygroundState,
} from '@/types/playground.types';
import {
  LANGUAGE_TEMPLATES,
  DEFAULT_EDITOR_SETTINGS,
  SUPPORTED_LANGUAGES,
  getDefaultCode,
} from '@/lib/language-templates';
import { PlaygroundService } from '@/services/playground.service';

export default function CodePlayground() {
  const [state, setState] = useState<PlaygroundState>({
    language: 'javascript',
    code: '',
    input: '',
    output: null,
    isExecuting: false,
    error: null,
    settings: DEFAULT_EDITOR_SETTINGS,
  });

  const [editorStats, setEditorStats] = useState<EditorStats>({
    lines: 0,
    characters: 0,
    cursorPosition: { line: 1, column: 1 },
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isLanguageChanging, setIsLanguageChanging] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(1); // Mock for now

  // Load saved state on mount
  useEffect(() => {
    const savedLanguage = PlaygroundService.getSavedLanguage() || 'javascript';
    const savedCode = PlaygroundService.getSavedCode(savedLanguage);
    const savedSettings = PlaygroundService.getSavedSettings() || DEFAULT_EDITOR_SETTINGS;

    setState((prev) => ({
      ...prev,
      language: savedLanguage,
      code: savedCode || getDefaultCode(savedLanguage),
      settings: savedSettings,
    }));
  }, []);

  // Auto-save code
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.code) {
        PlaygroundService.saveCode(state.language, state.code);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state.code, state.language]);

  // Keyboard shortcuts
  const handleRunCode = useCallback(async () => {
    setState((prev) => ({ ...prev, isExecuting: true, error: null }));

    try {
      const result = await PlaygroundService.executeCode({
        language: state.language,
        code: state.code,
        input: state.input,
      });

      setState((prev) => ({
        ...prev,
        output: result,
        isExecuting: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to execute code',
        isExecuting: false,
      }));
    }
  }, [state.language, state.code, state.input]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }

      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        PlaygroundService.saveCode(state.language, state.code);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunCode, state.code, state.language]);

  const handleLanguageChange = async (language: SupportedLanguage) => {
    PlaygroundService.saveCode(state.language, state.code);
    setIsLanguageChanging(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const savedCode = PlaygroundService.getSavedCode(language);
    const newCode = savedCode || getDefaultCode(language);

    setState((prev) => ({
      ...prev,
      language,
      code: newCode,
      output: null,
      error: null,
    }));

    PlaygroundService.saveLanguage(language);
    setShowLanguageDropdown(false);
    setTimeout(() => setIsLanguageChanging(false), 100);
  };

  const handleCodeChange = (newCode: string) => {
    setState((prev) => ({ ...prev, code: newCode }));
  };

  const handleClearOutput = () => {
    setState((prev) => ({ ...prev, output: null, error: null }));
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: prev.settings.theme === 'vs-dark' ? 'vs-light' : 'vs-dark',
      },
    }));
  };

  const currentLanguage = LANGUAGE_TEMPLATES[state.language];
  const fileName = `Main${currentLanguage.extension}`;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Premium Header Toolbar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 border-b border-gray-700/50 backdrop-blur-xl relative z-50 shadow-2xl shadow-black/20">
        {/* Left Section: Language & File Info */}
        <div className="flex items-center gap-4">
          {/* Language Selector - Redesigned */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-600/50 rounded-xl transition-all duration-200 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700/50">
                {typeof currentLanguage.icon === 'function' ? (
                  <currentLanguage.icon className="w-5 h-5" style={{ color: currentLanguage.iconColor }} />
                ) : (
                  <span className="text-lg">{currentLanguage.icon}</span>
                )}
              </div>
              <span className="font-semibold text-sm">{currentLanguage.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200" style={{ transform: showLanguageDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            <AnimatePresence>
              {showLanguageDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-gray-800/98 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden z-[9999]"
                  style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.15)' }}
                >
                  <div className="py-2">
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const langConfig = LANGUAGE_TEMPLATES[lang];
                      const isActive = state.language === lang;
                      return (
                        <motion.button
                          key={lang}
                          onClick={() => handleLanguageChange(lang)}
                          whileHover={{ x: 4, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-3 transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-violet-400 border-l-3 border-violet-500'
                              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 bg-gray-700/30">
                              {typeof langConfig.icon === 'function' ? (
                                <langConfig.icon className="w-6 h-6" style={{ color: langConfig.iconColor }} />
                              ) : (
                                <span className="text-2xl">{langConfig.icon}</span>
                              )}
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-semibold text-sm">{langConfig.name}</span>
                              <span className="text-xs text-gray-500">{langConfig.extension}</span>
                            </div>
                          </div>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50"
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* File Name Display */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/40 rounded-lg border border-gray-700/30">
            <FileCode className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-gray-300">{fileName}</span>
          </div>

          {/* Collaboration Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/40 rounded-lg border border-gray-700/30">
            <div className="relative">
              <Radio className="w-3.5 h-3.5 text-green-400 animate-pulse" />
              <div className="absolute inset-0 bg-green-400/20 rounded-full blur animate-ping" />
            </div>
            <span className="text-xs text-gray-400">Live Session</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-violet-500/20 rounded-md border border-violet-500/30">
              <Users className="w-3 h-3 text-violet-400" />
              <span className="text-xs font-semibold text-violet-400">{participantsCount}</span>
            </div>
          </div>
        </div>

        {/* Center Section: Run Button */}
        <div className="flex items-center gap-3">
          {/* Keyboard Shortcut Hint */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/40 rounded-lg border border-gray-700/30">
            <kbd className="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-xs font-mono text-gray-300 shadow-inner">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
            </kbd>
            <span className="text-xs text-gray-400">+</span>
            <kbd className="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-xs font-mono text-gray-300 shadow-inner">
              Enter
            </kbd>
            <span className="text-xs text-gray-500 ml-1">to run</span>
          </div>

          {/* Premium Run Button */}
          <motion.button
            onClick={handleRunCode}
            disabled={state.isExecuting}
            whileHover={{ scale: state.isExecuting ? 1 : 1.02 }}
            whileTap={{ scale: state.isExecuting ? 1 : 0.98 }}
            className="relative flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-violet-600 via-violet-500 to-blue-600 hover:from-violet-500 hover:via-violet-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-sm shadow-xl shadow-violet-500/30 transition-all duration-300 disabled:hover:scale-100 overflow-hidden group"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            {/* Running animation overlay */}
            {state.isExecuting && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-violet-400/20 via-blue-400/20 to-violet-400/20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            )}

            <Play className={`w-4 h-4 ${state.isExecuting ? 'animate-spin' : ''}`} fill="currentColor" />
            <span>{state.isExecuting ? 'Running...' : 'Run Code'}</span>
          </motion.button>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="p-2.5 hover:bg-gray-700/50 rounded-xl transition-colors group border border-transparent hover:border-gray-600/50"
            title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkTheme ? (
              <Sun className="w-4.5 h-4.5 text-yellow-400 group-hover:text-yellow-300" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-violet-400 group-hover:text-violet-300" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="p-2.5 hover:bg-gray-700/50 rounded-xl transition-colors group border border-transparent hover:border-gray-600/50"
            title="Settings"
          >
            <Settings className="w-4.5 h-4.5 text-gray-400 group-hover:text-violet-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            transition={{ duration: 0.2 }}
            className="p-2.5 hover:bg-gray-700/50 rounded-xl transition-colors group border border-transparent hover:border-gray-600/50"
            title="Download Code"
          >
            <Download className="w-4.5 h-4.5 text-gray-400 group-hover:text-cyan-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            className="p-2.5 hover:bg-gray-700/50 rounded-xl transition-colors group border border-transparent hover:border-gray-600/50"
            title="Share"
          >
            <Share2 className="w-4.5 h-4.5 text-gray-400 group-hover:text-pink-400" />
          </motion.button>
          <motion.button
            onClick={() => setIsFullscreen(!isFullscreen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 hover:bg-gray-700/50 rounded-xl transition-colors group border border-transparent hover:border-gray-600/50"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4.5 h-4.5 text-gray-400 group-hover:text-violet-400" />
            ) : (
              <Maximize2 className="w-4.5 h-4.5 text-gray-400 group-hover:text-violet-400" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Editor and Output Split View */}
      <div className="flex-1 overflow-hidden">
        <Split
          className="flex h-full"
          sizes={[60, 40]}
          minSize={[300, 300]}
          gutterSize={8}
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          gutter={(index, direction) => {
            const gutter = document.createElement('div');
            gutter.className = 'gutter gutter-horizontal bg-gray-800 hover:bg-violet-500/30 transition-colors cursor-col-resize rounded';
            return gutter;
          }}
        >
          {/* Editor Panel */}
          <div className="h-full bg-[#1e1e1e] relative">
            {/* Glow effect border */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-cyan-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" style={{ padding: '1px' }}>
              <div className="w-full h-full bg-[#1e1e1e] rounded-lg" />
            </div>

            {/* Language change transition overlay */}
            <AnimatePresence>
              {isLanguageChanging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-pink-600/30 to-cyan-600/30 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-3 px-6 py-3 bg-gray-900/80 border border-violet-500/50 rounded-xl"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      {(() => {
                        const langIcon = LANGUAGE_TEMPLATES[state.language].icon;
                        if (typeof langIcon === 'function') {
                          const IconComponent = langIcon;
                          return <IconComponent className="w-6 h-6" style={{ color: LANGUAGE_TEMPLATES[state.language].iconColor }} />;
                        }
                        return <span className="text-2xl">{langIcon}</span>;
                      })()}
                    </motion.div>
                    <span className="text-white font-medium">Switching language...</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <CodeEditor
              language={state.language}
              value={state.code}
              onChange={handleCodeChange}
              settings={state.settings}
              onStatsChange={setEditorStats}
              fileName={fileName}
              showInputPanel={showInputPanel}
              input={state.input}
              onInputChange={(input) => setState((prev) => ({ ...prev, input }))}
              onToggleInputPanel={() => setShowInputPanel(!showInputPanel)}
            />
          </div>

          {/* Output Panel */}
          <div className="h-full relative">
            {/* Glow effect border */}
            <div className="absolute inset-0 bg-gradient-to-l from-violet-500/20 via-pink-500/20 to-cyan-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" style={{ padding: '1px' }}>
              <div className="w-full h-full bg-gray-900 rounded-lg" />
            </div>
            <OutputPanel
              output={state.output}
              isExecuting={state.isExecuting}
              onClear={handleClearOutput}
            />
          </div>
        </Split>
      </div>

      {/* Premium Status Bar */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 border-t border-gray-700/50 text-xs backdrop-blur-xl relative overflow-hidden shadow-lg shadow-black/10">
        {/* Executing indicator animation */}
        {state.isExecuting && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent origin-left"
          />
        )}

        <div className="flex items-center gap-6 text-gray-400">
          <span className="flex items-center gap-2">
            <motion.div
              className="flex items-center justify-center w-5 h-5 rounded"
              animate={state.isExecuting ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: state.isExecuting ? Infinity : 0 }}
            >
              {typeof currentLanguage.icon === 'function' ? (
                <currentLanguage.icon className="w-4 h-4" style={{ color: currentLanguage.iconColor }} />
              ) : (
                <span className="text-base">{currentLanguage.icon}</span>
              )}
            </motion.div>
            <span className="text-violet-400 font-semibold">{currentLanguage.name}</span>
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-800/40 rounded border border-gray-700/30">
            <span className="text-gray-500">Ln</span>
            <span className="font-mono font-semibold text-gray-300">{editorStats.cursorPosition.line}</span>
            <span className="text-gray-500">,</span>
            <span className="text-gray-500">Col</span>
            <span className="font-mono font-semibold text-gray-300">{editorStats.cursorPosition.column}</span>
          </span>
          <span className="px-2 py-1 bg-gray-800/40 rounded border border-gray-700/30">
            {editorStats.lines} lines
          </span>
          <span className="px-2 py-1 bg-gray-800/40 rounded border border-gray-700/30">
            {editorStats.characters} chars
          </span>
        </div>

        <div className="flex items-center gap-4 text-gray-400">
          {state.isExecuting && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-violet-400 px-2 py-1 bg-violet-500/10 rounded border border-violet-500/20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full"
              />
              Executing...
            </motion.span>
          )}
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1.5 px-2 py-1 bg-gray-800/40 rounded border border-gray-700/30"
          >
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
            Auto-save
          </motion.span>
          {state.output && (
            <ExecutionMetrics output={state.output} />
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showLanguageDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLanguageDropdown(false)}
        />
      )}
    </div>
  );
}
