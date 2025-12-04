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
} from 'lucide-react';
import CodeEditor from './CodeEditor';
import OutputPanel from './OutputPanel';
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }

      // Ctrl+S or Cmd+S to save (already auto-saving, but we'll prevent default)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        PlaygroundService.saveCode(state.language, state.code);
        // Could show a toast notification here
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.code, state.language]);

  const handleLanguageChange = (language: SupportedLanguage) => {
    // Save current code before switching
    PlaygroundService.saveCode(state.language, state.code);

    // Load saved code for new language or use default
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
  };

  const handleCodeChange = (newCode: string) => {
    setState((prev) => ({ ...prev, code: newCode }));
  };

  const handleRunCode = async () => {
    setState((prev) => ({ ...prev, isExecuting: true, error: null }));

    try {
      // Call the API (which will use mock data for now)
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
  };

  const handleClearOutput = () => {
    setState((prev) => ({ ...prev, output: null, error: null }));
  };

  const currentLanguage = LANGUAGE_TEMPLATES[state.language];

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-700 backdrop-blur-sm relative z-50">
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded">
                {typeof currentLanguage.icon === 'function' ? (
                  <currentLanguage.icon className="w-5 h-5" style={{ color: currentLanguage.iconColor }} />
                ) : (
                  <span className="text-lg">{currentLanguage.icon}</span>
                )}
              </div>
              <span className="font-medium">{currentLanguage.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            <AnimatePresence>
              {showLanguageDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden z-[9999]"
                  style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.1)' }}
                >
                  <div className="py-2">
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const langConfig = LANGUAGE_TEMPLATES[lang];
                      const isActive = state.language === lang;
                      return (
                        <motion.button
                          key={lang}
                          onClick={() => handleLanguageChange(lang)}
                          whileHover={{ x: 4 }}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-3 transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-violet-400 border-l-2 border-violet-500'
                              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0">
                              {typeof langConfig.icon === 'function' ? (
                                <langConfig.icon className="w-6 h-6" style={{ color: langConfig.iconColor }} />
                              ) : (
                                <span className="text-2xl">{langConfig.icon}</span>
                              )}
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{langConfig.name}</span>
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

          {/* Run Button */}
          <button
            onClick={handleRunCode}
            disabled={state.isExecuting}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-medium shadow-lg shadow-violet-500/25 transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
          >
            <Play className="w-4 h-4" fill="currentColor" />
            {state.isExecuting ? 'Running...' : 'Run Code'}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Download Code"
          >
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-gray-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-400" />
            )}
          </button>
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
            gutter.className = 'gutter gutter-horizontal bg-gray-800 hover:bg-violet-500/20 transition-colors cursor-col-resize';
            return gutter;
          }}
        >
          {/* Editor Panel */}
          <div className="h-full bg-[#1e1e1e]">
            <CodeEditor
              language={state.language}
              value={state.code}
              onChange={handleCodeChange}
              settings={state.settings}
              onStatsChange={setEditorStats}
            />
          </div>

          {/* Output Panel */}
          <div className="h-full">
            <OutputPanel
              output={state.output}
              isExecuting={state.isExecuting}
              onClear={handleClearOutput}
            />
          </div>
        </Split>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-t border-gray-700 text-xs backdrop-blur-sm">
        <div className="flex items-center gap-4 text-gray-400">
          <span>
            <span className="text-violet-400 font-medium">{currentLanguage.name}</span>
          </span>
          <span className="flex items-center gap-1">
            Ln {editorStats.cursorPosition.line}, Col {editorStats.cursorPosition.column}
          </span>
          <span>{editorStats.lines} lines</span>
          <span>{editorStats.characters} characters</span>
        </div>

        <div className="flex items-center gap-4 text-gray-400">
          <span>Auto-save enabled</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-700 border border-gray-600 rounded text-xs">Ctrl+Enter</kbd>
            to run
          </span>
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
