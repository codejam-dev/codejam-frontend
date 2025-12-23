'use client';

import { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { SupportedLanguage, EditorSettings, EditorStats } from '@/types/playground.types';
import { getLanguageConfig } from '@/lib/language-templates';
import * as monaco from 'monaco-editor';
import { FileCode, ChevronRight, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeEditorProps {
  language: SupportedLanguage;
  value: string;
  onChange: (value: string) => void;
  settings: EditorSettings;
  onStatsChange?: (stats: EditorStats) => void;
  fileName: string;
  showInputPanel?: boolean;
  input?: string;
  onInputChange?: (input: string) => void;
  onToggleInputPanel?: () => void;
}

export default function CodeEditor({
  language,
  value,
  onChange,
  settings,
  onStatsChange,
  fileName,
  showInputPanel = false,
  input = '',
  onInputChange,
  onToggleInputPanel,
}: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsLoading(false);

    // Update stats on cursor position change
    editor.onDidChangeCursorPosition((e) => {
      updateStats(editor);
    });

    // Update stats on content change
    editor.onDidChangeModelContent(() => {
      updateStats(editor);
    });

    // Initial stats
    updateStats(editor);

    // Configure editor
    editor.updateOptions({
      fontSize: settings.fontSize,
      tabSize: settings.tabSize,
      minimap: { enabled: settings.minimap },
      lineNumbers: settings.lineNumbers ? 'on' : 'off',
      wordWrap: settings.wordWrap ? 'on' : 'off',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 20, bottom: 20, left: 16, right: 16 },
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
    });
  };

  const updateStats = (editor: monaco.editor.IStandaloneCodeEditor) => {
    if (!onStatsChange) return;

    const model = editor.getModel();
    const position = editor.getPosition();

    if (model && position) {
      const stats: EditorStats = {
        lines: model.getLineCount(),
        characters: model.getValueLength(),
        cursorPosition: {
          line: position.lineNumber,
          column: position.column,
        },
      };
      onStatsChange(stats);
    }
  };

  // Update editor options when settings change
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: settings.fontSize,
        tabSize: settings.tabSize,
        minimap: { enabled: settings.minimap },
        lineNumbers: settings.lineNumbers ? 'on' : 'off',
        wordWrap: settings.wordWrap ? 'on' : 'off',
      });
    }
  }, [settings]);

  const languageConfig = getLanguageConfig(language);

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Editor Header Bar with Breadcrumbs */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800/40 border-b border-gray-700/30 backdrop-blur-sm">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Playground</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <div className="flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-gray-300 font-medium">{fileName}</span>
          </div>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <kbd className="px-2 py-0.5 bg-gray-700/50 border border-gray-600/50 rounded text-xs font-mono text-gray-400 shadow-inner">
            {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
          </kbd>
          <span>+</span>
          <kbd className="px-2 py-0.5 bg-gray-700/50 border border-gray-600/50 rounded text-xs font-mono text-gray-400 shadow-inner">
            Enter
          </kbd>
          <span>to run</span>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Loading editor...</p>
            </div>
          </div>
        )}

        <Editor
          height="100%"
          language={languageConfig.monacoLanguage}
          value={value}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
          theme={settings.theme}
          options={{
            fontSize: settings.fontSize,
            tabSize: settings.tabSize,
            minimap: { enabled: settings.minimap },
            lineNumbers: settings.lineNumbers ? 'on' : 'off',
            wordWrap: settings.wordWrap ? 'on' : 'off',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 20, bottom: 20, left: 16, right: 16 },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
            fontLigatures: true,
            renderLineHighlight: 'all',
            bracketPairColorization: {
              enabled: true,
            },
            renderWhitespace: 'selection',
            rulers: [],
            fontSize: 14,
            lineHeight: 22,
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
              <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
          }
        />
      </div>

      {/* Collapsible Input Panel */}
      {onToggleInputPanel && (
        <>
          {/* Toggle Button */}
          <button
            onClick={onToggleInputPanel}
            className="flex items-center justify-between px-4 py-2 bg-gray-800/60 border-t border-gray-700/30 hover:bg-gray-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Terminal className="w-4 h-4" />
              <span>Input</span>
            </div>
            {showInputPanel ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {/* Input Panel */}
          <AnimatePresence>
            {showInputPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-gray-700/30 bg-gray-800/40"
              >
                <div className="px-4 py-3">
                  <textarea
                    value={input}
                    onChange={(e) => onInputChange?.(e.target.value)}
                    placeholder="Enter input for your program..."
                    className="w-full h-24 px-3 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 font-mono resize-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
