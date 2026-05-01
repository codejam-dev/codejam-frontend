/**
 * Playground TypeScript Type Definitions
 */

import { IconType } from 'react-icons';

/** Languages the executor accepts (matches backend `CodeSubmission.Language`). */
export type SupportedLanguage = 'javascript' | 'python' | 'java';

/** Same plus retired UI-only labels kept for run history / old share links. */
export type HistoryDisplayLanguage = SupportedLanguage | 'cpp' | 'c' | 'go' | 'rust';

export interface LanguageConfig {
  id: HistoryDisplayLanguage;
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

/** Bottom execution console (desktop) — tab + layout prefs */
export type ConsoleWorkspaceTab = 'stdout' | 'stderr' | 'console';

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

/** Backend execution status */
export type RunStatus = 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'SYSTEM_ERROR' | 'CANCELLED';

export interface RunHistoryItem {
  id: number;
  roomId: string;
  language: string; // e.g. JAVASCRIPT, PYTHON, JAVA
  code: string;
  status: RunStatus;
  stdout: string | null;
  stderr: string | null;
  exitCode: number | null;
  executionTimeMs: number | null;
  /** Peak memory (MB) when returned by API */
  memoryMb?: number | null;
  errorMessage: string | null;
  createdAt: string; // ISO date
}
