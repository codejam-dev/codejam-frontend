'use client';

import { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { SupportedLanguage, EditorSettings, EditorStats } from '@/types/playground.types';
import { getLanguageConfig } from '@/lib/language-templates';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  language: SupportedLanguage;
  value: string;
  onChange: (value: string) => void;
  settings: EditorSettings;
  onStatsChange?: (stats: EditorStats) => void;
}

export default function CodeEditor({
  language,
  value,
  onChange,
  settings,
  onStatsChange,
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
      padding: { top: 16, bottom: 16 },
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
    <div className="relative h-full w-full">
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
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
          fontLigatures: true,
          renderLineHighlight: 'all',
          bracketPairColorization: {
            enabled: true,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
            <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          </div>
        }
      />
    </div>
  );
}
