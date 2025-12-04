/**
 * Playground TypeScript Type Definitions
 */

import { IconType } from 'react-icons';

export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'c'
  | 'go'
  | 'rust';

export interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  monacoLanguage: string;
  defaultCode: string;
  extension: string;
  icon: string | IconType;
  iconColor: string;
}

export interface CodeExecutionRequest {
  language: SupportedLanguage;
  code: string;
  input?: string;
}

export interface CodeExecutionResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number; // in milliseconds
  memory?: number; // in MB
  error?: string;
}

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  minimap: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  theme: 'vs-dark' | 'vs-light';
}

export interface PlaygroundState {
  language: SupportedLanguage;
  code: string;
  input: string;
  output: CodeExecutionResponse | null;
  isExecuting: boolean;
  error: string | null;
  settings: EditorSettings;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface EditorStats {
  lines: number;
  characters: number;
  cursorPosition: CursorPosition;
}
