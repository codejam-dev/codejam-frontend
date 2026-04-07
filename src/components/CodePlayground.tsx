'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Split from 'react-split';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  ChevronDown,
  Moon,
  Sun,
  FileCode,
  Search,
  MoreHorizontal,
  ChevronRight,
  Terminal,
  X,
} from 'lucide-react';
import CodeEditor, { type CodeEditorHandle } from './CodeEditor';
import OutputPanel from './OutputPanel';
import RunHistoryPanel, { runHistoryLanguage, RunHistoryTabContent } from './RunHistoryPanel';
import {
  ConsoleMessage,
  FloatingRunButton,
  MobileHeader,
  MobileOutputDock,
} from '@/features/playground/components';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  SupportedLanguage,
  EditorStats,
  PlaygroundState,
  RunHistoryItem,
  ConsoleWorkspaceTab,
} from '@/types/playground.types';
import {
  LANGUAGE_TEMPLATES,
  DEFAULT_EDITOR_SETTINGS,
  SUPPORTED_LANGUAGES,
  getDefaultCode,
} from '@/lib/language-templates';
import { PlaygroundService } from '@/services/playground.service';
import { useAuth } from '@/contexts/AuthContext';

export default function CodePlayground() {
  const { authState } = useAuth();
  const isMobile = useIsMobile();
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

  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isLanguageChanging, setIsLanguageChanging] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [historyRuns, setHistoryRuns] = useState<RunHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [desktopHistoryOpen, setDesktopHistoryOpen] = useState(false);
  const [consoleTab, setConsoleTab] = useState<ConsoleWorkspaceTab>('stdout');
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [stdinExpanded, setStdinExpanded] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [mobileRunRevealTick, setMobileRunRevealTick] = useState(0);
  const [outputAutoScrollTail, setOutputAutoScrollTail] = useState(true);

  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<CodeEditorHandle>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showLanguageDropdown || showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown, showMoreMenu]);

  useEffect(() => {
    const savedLanguage = PlaygroundService.getSavedLanguage() || 'javascript';
    const savedCode = PlaygroundService.getSavedCode(savedLanguage);
    const savedSettings = PlaygroundService.getSavedSettings() || DEFAULT_EDITOR_SETTINGS;
    const consoleUi = PlaygroundService.getConsoleWorkspaceUi();

    setState((prev) => ({
      ...prev,
      language: savedLanguage,
      code: savedCode || getDefaultCode(savedLanguage),
      settings: savedSettings,
    }));

    if (consoleUi) {
      setConsoleTab(consoleUi.activeTab);
    }
    setOutputAutoScrollTail(PlaygroundService.getOutputAutoScrollTail());
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.code) {
        PlaygroundService.saveCode(state.language, state.code);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state.code, state.language]);

  const handleRunCode = useCallback(async () => {
    setState((prev) => ({ ...prev, isExecuting: true, error: null }));

    try {
      const result = await PlaygroundService.executeCode(
        {
          language: state.language,
          code: state.code,
          input: state.input,
        },
        authState.token
      );

      setState((prev) => ({
        ...prev,
        output: result,
        isExecuting: false,
      }));
      if (isMobile) setMobileRunRevealTick((t) => t + 1);
      PlaygroundService.getRunHistory(authState.token).then(setHistoryRuns);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to execute code';
      setState((prev) => ({
        ...prev,
        error: message,
        output: {
          stdout: '',
          stderr: message,
          exitCode: 1,
          executionTime: 0,
        },
        isExecuting: false,
      }));
      if (isMobile) setMobileRunRevealTick((t) => t + 1);
    }
  }, [state.language, state.code, state.input, authState.token, isMobile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }

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

  const handleClearConsole = () => {
    setConsoleMessages([]);
  };

  const handleConsoleTabChange = useCallback((tab: ConsoleWorkspaceTab) => {
    setConsoleTab(tab);
    PlaygroundService.saveConsoleActiveTab(tab);
  }, []);

  const handleOutputAutoScrollTailChange = useCallback((enabled: boolean) => {
    setOutputAutoScrollTail(enabled);
    PlaygroundService.saveOutputAutoScrollTail(enabled);
  }, []);

  const loadRunHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const runs = await PlaygroundService.getRunHistory(authState.token);
      setHistoryRuns(runs);
    } finally {
      setHistoryLoading(false);
    }
  }, [authState.token]);

  const handleRestoreFromHistory = useCallback((run: RunHistoryItem) => {
    const lang = runHistoryLanguage(run.language);
    setState((prev) => ({
      ...prev,
      language: lang,
      code: run.code,
      output: null,
      error: null,
    }));
    PlaygroundService.saveLanguage(lang);
    PlaygroundService.saveCode(lang, run.code);
    setDesktopHistoryOpen(false);
  }, []);

  const openDesktopHistory = useCallback(() => {
    setDesktopHistoryOpen(true);
    void loadRunHistory();
  }, [loadRunHistory]);

  const openMobileHistory = useCallback(() => {
    setShowHistoryPanel(true);
    void loadRunHistory();
  }, [loadRunHistory]);

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

  const getFileName = () => {
    if (state.language === 'java') {
      const match = state.code.match(/public\s+class\s+(\w+)/);
      const className = match ? match[1] : 'Main';
      return `${className}${currentLanguage.extension}`;
    }
    return `Main${currentLanguage.extension}`;
  };
  const fileName = getFileName();

  const languageSelector = (
    <div className="relative" ref={languageDropdownRef}>
      <motion.button
        type="button"
        onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative flex items-center gap-2 overflow-hidden rounded-lg border border-gray-600/50 bg-gray-800/60 px-3 py-2 transition-all hover:border-gray-500/60"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-700/50">
          {typeof currentLanguage.icon === 'function' ? (
            <currentLanguage.icon className="h-4 w-4" style={{ color: currentLanguage.iconColor }} />
          ) : (
            <span className="text-base">{currentLanguage.icon}</span>
          )}
        </div>
        <span className="text-sm font-medium">{currentLanguage.name}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {showLanguageDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-[100000] mt-1.5 w-60 overflow-hidden rounded-xl border border-gray-700/60 bg-gray-900/98 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const langConfig = LANGUAGE_TEMPLATES[lang];
                const isActive = state.language === lang;
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageChange(lang)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? 'bg-violet-500/15 text-violet-300'
                        : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-800/60">
                      {typeof langConfig.icon === 'function' ? (
                        <langConfig.icon className="h-5 w-5" style={{ color: langConfig.iconColor }} />
                      ) : (
                        <span className="text-lg">{langConfig.icon}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{langConfig.name}</span>
                      <span className="text-xs text-gray-500">{langConfig.extension}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.div
      className="relative flex h-full flex-col overflow-hidden bg-[#0a0a0f]/95 text-white"
      initial={{ opacity: 0, scale: 0.995 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {isMobile && (
        <MobileHeader
          language={state.language}
          onLanguageChange={handleLanguageChange}
          fileName={fileName}
          isDarkTheme={isDarkTheme}
          onToggleTheme={toggleTheme}
          onOpenHistory={openMobileHistory}
        />
      )}

      {isMobile && (
        <motion.div
          className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#1e1e1e]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <AnimatePresence>
                {isLanguageChanging && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-violet-600/25 via-pink-600/25 to-cyan-600/25 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 rounded-lg border border-violet-500/40 bg-gray-900/85 px-4 py-2 text-sm text-white">
                      Switching…
                    </div>
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
                onRunCode={handleRunCode}
                mobilePadEditorForStdinStrip
              />
            </div>

            <MobileOutputDock
              output={state.output}
              isExecuting={state.isExecuting}
              onClear={handleClearOutput}
              activeTab={consoleTab}
              onTabChange={handleConsoleTabChange}
              consoleMessages={consoleMessages}
              onClearConsole={handleClearConsole}
              revealAfterRunTick={mobileRunRevealTick}
              outputAutoScrollTail={outputAutoScrollTail}
              onOutputAutoScrollTailChange={handleOutputAutoScrollTailChange}
            />
          </div>
        </motion.div>
      )}

      {!isMobile && (
        <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
          <motion.div
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <motion.div
              className="relative z-40 flex shrink-0 items-center justify-between gap-3 border-b border-gray-800/60 bg-zinc-950/90 px-4 py-2 backdrop-blur-md"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {languageSelector}
                <div className="flex min-w-0 items-center gap-2 rounded-md border border-gray-700/40 bg-gray-900/50 px-2.5 py-1.5">
                  <FileCode className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                  <span className="truncate text-xs font-medium text-gray-300">{fileName}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <motion.button
                  type="button"
                  onClick={openDesktopHistory}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-700/50 hover:bg-zinc-800/50 hover:text-zinc-200"
                  title="Run history"
                >
                  ⧖ History
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleRunCode}
                  disabled={state.isExecuting}
                  whileHover={{ scale: state.isExecuting ? 1 : 1.03 }}
                  whileTap={{ scale: state.isExecuting ? 1 : 0.97 }}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 px-5 py-2 text-sm font-semibold shadow-lg shadow-violet-900/20 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-80"
                >
                  <Play className={`h-4 w-4 ${state.isExecuting ? 'animate-spin' : ''}`} fill="currentColor" />
                  <span>{state.isExecuting ? 'Running…' : 'Run'}</span>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => editorRef.current?.triggerFind()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg border border-transparent p-2 text-gray-400 transition-colors hover:border-gray-700/50 hover:bg-gray-800/50 hover:text-white"
                  title="Find in editor"
                >
                  <Search className="h-4 w-4" />
                </motion.button>

                <motion.button
                  type="button"
                  onClick={toggleTheme}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg border border-transparent p-2 text-gray-400 transition-colors hover:border-gray-700/50 hover:bg-gray-800/50 hover:text-white"
                  title={isDarkTheme ? 'Light theme' : 'Dark theme'}
                >
                  {isDarkTheme ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-violet-400" />}
                </motion.button>

                <div className="relative" ref={moreMenuRef}>
                  <motion.button
                    type="button"
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg border border-transparent p-2 text-gray-400 transition-colors hover:border-gray-700/50 hover:bg-gray-800/50 hover:text-white"
                    title="More"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </motion.button>
                  <AnimatePresence>
                    {showMoreMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg border border-gray-700/60 bg-gray-900/98 py-1 shadow-xl"
                      >
                        <p className="px-3 py-2 text-[10px] leading-snug text-gray-500">
                          More actions (share, download, settings) will land here.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="min-h-0 flex-1">
                <Split
                  className="flex h-full"
                  sizes={[58, 42]}
                  minSize={[280, 280]}
                  gutterSize={6}
                  snapOffset={24}
                  dragInterval={1}
                  direction="horizontal"
                  cursor="col-resize"
                  gutter={() => {
                    const gutter = document.createElement('div');
                    gutter.className =
                      'gutter gutter-horizontal cursor-col-resize bg-zinc-800/80 hover:bg-violet-500/25 transition-colors';
                    return gutter;
                  }}
                >
                  <div className="relative h-full min-h-0 bg-[#1e1e1e]">
                    <AnimatePresence>
                      {isLanguageChanging && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                        >
                          <span className="text-sm text-gray-200">Switching language…</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <CodeEditor
                      ref={editorRef}
                      hideChrome
                      language={state.language}
                      value={state.code}
                      onChange={handleCodeChange}
                      settings={state.settings}
                      onStatsChange={setEditorStats}
                      fileName={fileName}
                      onRunCode={handleRunCode}
                    />
                  </div>

                  <OutputPanel
                    output={state.output}
                    isExecuting={state.isExecuting}
                    onClear={handleClearOutput}
                    activeConsoleTab={consoleTab}
                    onConsoleTabChange={handleConsoleTabChange}
                    consoleMessages={consoleMessages}
                    onClearConsole={handleClearConsole}
                    outputAutoScrollTail={outputAutoScrollTail}
                    onOutputAutoScrollTailChange={handleOutputAutoScrollTailChange}
                  />
                </Split>
              </div>

              <div className="shrink-0 border-t border-gray-800/60 bg-[#0c0c10]">
                <button
                  type="button"
                  onClick={() => setStdinExpanded(!stdinExpanded)}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-xs text-zinc-400 transition-colors hover:bg-zinc-900/80 hover:text-zinc-200"
                >
                  <span className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5" />
                    Program stdin {state.input.trim() ? `(${state.input.length} chars)` : ''}
                  </span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${stdinExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {stdinExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-zinc-800/60"
                    >
                      <div className="px-4 py-2">
                        <textarea
                          value={state.input}
                          onChange={(e) => setState((prev) => ({ ...prev, input: e.target.value }))}
                          placeholder="stdin for your program…"
                          rows={4}
                          className="w-full resize-y rounded-md border border-zinc-700/50 bg-zinc-950/80 px-3 py-2 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-gray-800/60 bg-zinc-950/95 px-4 py-1.5 text-[11px] text-zinc-500">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  Ln {editorStats.cursorPosition.line}, Col {editorStats.cursorPosition.column}
                </span>
                <span className="text-zinc-600">·</span>
                <span>{editorStats.characters} chars</span>
              </div>

              <div className="flex items-center gap-1.5">
                {state.isExecuting && (
                  <span className="mr-2 text-violet-400/90">Executing…</span>
                )}
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                <span className="text-zinc-400">Auto-saved</span>
              </div>

              <span className="text-zinc-500">Solo</span>
            </div>
          </motion.div>

          <motion.aside
            initial={false}
            animate={{ width: desktopHistoryOpen ? 380 : 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-l border-zinc-800 bg-zinc-950"
            aria-hidden={!desktopHistoryOpen}
          >
            <div className="flex h-full min-h-0 w-[380px] flex-col">
              <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-3 py-2">
                <h2 className="text-xs font-semibold text-zinc-300">Run history</h2>
                <button
                  type="button"
                  onClick={() => setDesktopHistoryOpen(false)}
                  className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                  aria-label="Close history"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <RunHistoryTabContent
                  runs={historyRuns}
                  isLoading={historyLoading}
                  onRestoreCode={handleRestoreFromHistory}
                />
              </div>
            </div>
          </motion.aside>
        </div>
      )}

      {isMobile && (
        <FloatingRunButton onClick={handleRunCode} isExecuting={state.isExecuting} />
      )}

      {isMobile && (
        <div className="relative z-[60] flex shrink-0 items-center justify-between gap-2 border-t border-gray-800/60 bg-zinc-950/95 px-4 py-1.5 text-[11px] text-zinc-500">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              Ln {editorStats.cursorPosition.line}, Col {editorStats.cursorPosition.column}
            </span>
            <span className="text-zinc-600">·</span>
            <span>{editorStats.characters} chars</span>
          </div>

          <div className="flex items-center gap-1.5">
            {state.isExecuting && (
              <span className="mr-2 text-violet-400/90">Executing…</span>
            )}
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
            <span className="text-zinc-400">Auto-saved</span>
          </div>

          <span className="text-zinc-500">Solo</span>
        </div>
      )}

      {isMobile && (
        <RunHistoryPanel
          isOpen={showHistoryPanel}
          onClose={() => setShowHistoryPanel(false)}
          runs={historyRuns}
          isLoading={historyLoading}
          onRestoreCode={handleRestoreFromHistory}
        />
      )}
    </motion.div>
  );
}
