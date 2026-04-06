'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { SupportedLanguage, EditorSettings, EditorStats } from '@/types/playground.types';
import { getLanguageConfig } from '@/lib/language-templates';
import * as monaco from 'monaco-editor';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsBelow768Width } from '@/hooks/useMediaQuery';

export interface CodeEditorHandle {
  triggerFind: () => void;
}

/** Collapsed Input row: border-t + py-2 + text-sm + h-4 icon (matches stdin button strip). */
export const MOBILE_STDIN_STRIP_HEIGHT_PX = 41;

interface CodeEditorProps {
  language: SupportedLanguage;
  value: string;
  onChange: (value: string) => void;
  settings: EditorSettings;
  onStatsChange?: (stats: EditorStats) => void;
  fileName: string;
  /** Hide breadcrumb bar and ⌘Enter hint; use full height for Monaco only */
  hideChrome?: boolean;
  showInputPanel?: boolean;
  input?: string;
  onInputChange?: (input: string) => void;
  onToggleInputPanel?: () => void;
  onRunCode?: () => void;
  /** Mobile: pad Monaco scroll area so FAB does not cover the last lines; matches stdin strip height. */
  mobilePadEditorForStdinStrip?: boolean;
}

const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor(
  {
    language,
    value,
    onChange,
    settings,
    onStatsChange,
    fileName,
    hideChrome = false,
    showInputPanel = false,
    input = '',
    onInputChange,
    onToggleInputPanel,
    onRunCode,
    mobilePadEditorForStdinStrip = false,
  },
  ref
) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const onRunCodeRef = useRef(onRunCode);
  const [isLoading, setIsLoading] = useState(true);
  const isBelow768 = useIsBelow768Width();
  const minimapEnabled = !isBelow768 && settings.minimap;
  const wordWrapEffective = isBelow768 || settings.wordWrap;

  useEffect(() => {
    onRunCodeRef.current = onRunCode;
  }, [onRunCode]);

  useImperativeHandle(ref, () => ({
    triggerFind: () => {
      editorRef.current?.getAction('actions.find')?.run();
    },
  }));

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsLoading(false);

    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        onRunCodeRef.current?.();
      },
    });

    editor.onDidChangeCursorPosition(() => {
      updateStats(editor);
    });

    editor.onDidChangeModelContent(() => {
      updateStats(editor);
    });

    updateStats(editor);

    editor.updateOptions({
      fontSize: settings.fontSize,
      tabSize: settings.tabSize,
      minimap: { enabled: minimapEnabled },
      lineNumbers: settings.lineNumbers ? 'on' : 'off',
      wordWrap: wordWrapEffective ? 'on' : 'off',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: hideChrome ? 12 : 20, bottom: hideChrome ? 12 : 20 },
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
      onStatsChange({
        lines: model.getLineCount(),
        characters: model.getValueLength(),
        cursorPosition: {
          line: position.lineNumber,
          column: position.column,
        },
      });
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: settings.fontSize,
        tabSize: settings.tabSize,
        minimap: { enabled: minimapEnabled },
        lineNumbers: settings.lineNumbers ? 'on' : 'off',
        wordWrap: wordWrapEffective ? 'on' : 'off',
        padding: { top: hideChrome ? 12 : 20, bottom: hideChrome ? 12 : 20 },
      });
    }
  }, [settings, hideChrome, minimapEnabled, wordWrapEffective]);

  const languageConfig = getLanguageConfig(language);

  const showInputChrome = !hideChrome && onToggleInputPanel;

  return (
    <div className="relative flex h-full w-full flex-col">
      {!hideChrome && (
        <div className="flex items-center justify-between border-b border-gray-700/30 bg-gray-800/40 px-4 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="font-medium">{fileName}</span>
          </div>
        </div>
      )}

      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        style={
          mobilePadEditorForStdinStrip
            ? { paddingBottom: MOBILE_STDIN_STRIP_HEIGHT_PX }
            : undefined
        }
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#1e1e1e]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500" />
              <p className="text-sm text-gray-400">Loading editor...</p>
            </div>
          </div>
        )}

        <Editor
          height="100%"
          language={languageConfig.monacoLanguage}
          value={value}
          onChange={(v) => onChange(v || '')}
          onMount={handleEditorDidMount}
          theme={settings.theme}
          options={{
            fontSize: settings.fontSize,
            tabSize: settings.tabSize,
            minimap: { enabled: minimapEnabled },
            lineNumbers: settings.lineNumbers ? 'on' : 'off',
            wordWrap: wordWrapEffective ? 'on' : 'off',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: hideChrome ? 12 : 20, bottom: hideChrome ? 12 : 20 },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
            fontLigatures: true,
            renderLineHighlight: 'all',
            bracketPairColorization: { enabled: true },
            renderWhitespace: 'selection',
            rulers: [],
            lineHeight: 22,
          }}
          loading={
            <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500" />
            </div>
          }
        />
      </div>

      {showInputChrome && (
        <div className="relative z-40 shrink-0">
          <button
            type="button"
            onClick={onToggleInputPanel}
            className="flex items-center justify-between border-t border-gray-700/30 bg-gray-800/60 px-4 py-2 transition-colors hover:bg-gray-700/60"
          >
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Terminal className="h-4 w-4" />
              <span>Input</span>
            </div>
            {showInputPanel ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            )}
          </button>

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
                    className="h-24 w-full resize-none rounded-lg border border-gray-700/50 bg-gray-900/50 px-3 py-2 font-mono text-sm text-gray-300 placeholder-gray-600 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
});

export default CodeEditor;
