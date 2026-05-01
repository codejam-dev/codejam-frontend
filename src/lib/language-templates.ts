/**
 * Language templates and playground vs history-only configs.
 */

import {
  LanguageConfig,
  SupportedLanguage,
  HistoryDisplayLanguage,
} from '@/types/playground.types';
import {
  SiJavascript,
  SiPython,
  SiCplusplus,
  SiC,
  SiGo,
  SiRust,
} from 'react-icons/si';
import { FaJava } from 'react-icons/fa';

/** Executor-backed languages shown in the playground picker. */
export const EXECUTABLE_LANGUAGES: SupportedLanguage[] = [
  'javascript',
  'python',
  'java',
];

export const LANGUAGE_TEMPLATES: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    monacoLanguage: 'javascript',
    extension: '.js',
    icon: SiJavascript,
    iconColor: '#F7DF1E',
    defaultCode: `// JavaScript Playground
console.log("Hello, CodeJam!");

// Your code here
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));
`,
  },
  python: {
    id: 'python',
    name: 'Python',
    monacoLanguage: 'python',
    extension: '.py',
    icon: SiPython,
    iconColor: '#3776AB',
    defaultCode: `# Python Playground
print("Hello, CodeJam!")

# Your code here
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(f"Fibonacci(10): {fibonacci(10)}")

# List comprehension example
squares = [x**2 for x in range(10)]
print(f"Squares: {squares}")
`,
  },
  java: {
    id: 'java',
    name: 'Java',
    monacoLanguage: 'java',
    extension: '.java',
    icon: FaJava,
    iconColor: '#007396',
    defaultCode: `// Java Playground
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeJam!");

        // Your code here
        int result = fibonacci(10);
        System.out.println("Fibonacci(10): " + result);
    }

    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}
`,
  },
};

/** Styling for old runs only — not offered in the runner until backend images ship. */
const LEGACY_LANGUAGE_TEMPLATES: Record<
  Exclude<HistoryDisplayLanguage, SupportedLanguage>,
  LanguageConfig
> = {
  cpp: {
    id: 'cpp',
    name: 'C++',
    monacoLanguage: 'cpp',
    extension: '.cpp',
    icon: SiCplusplus,
    iconColor: '#00599C',
    defaultCode: '',
  },
  c: {
    id: 'c',
    name: 'C',
    monacoLanguage: 'c',
    extension: '.c',
    icon: SiC,
    iconColor: '#A8B9CC',
    defaultCode: '',
  },
  go: {
    id: 'go',
    name: 'Go',
    monacoLanguage: 'go',
    extension: '.go',
    icon: SiGo,
    iconColor: '#00ADD8',
    defaultCode: '',
  },
  rust: {
    id: 'rust',
    name: 'Rust',
    monacoLanguage: 'rust',
    extension: '.rs',
    icon: SiRust,
    iconColor: '#CE422B',
    defaultCode: '',
  },
};

export const DISPLAY_LANGUAGE_CONFIGS: Record<
  HistoryDisplayLanguage,
  LanguageConfig
> = {
  ...LANGUAGE_TEMPLATES,
  ...LEGACY_LANGUAGE_TEMPLATES,
};

const HISTORY_LANGUAGE_ALIASES: Record<string, HistoryDisplayLanguage> = {
  javascript: 'javascript',
  js: 'javascript',
  python: 'python',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  'c++': 'cpp',
  c: 'c',
  go: 'go',
  golang: 'go',
  rust: 'rust',
  rs: 'rust',
};

/** Normalize API/history language strings for icons and filenames. */
export function normalizeHistoryLanguage(lang: string): HistoryDisplayLanguage {
  const raw = (lang ?? 'javascript').trim().toLowerCase();
  return HISTORY_LANGUAGE_ALIASES[raw] ?? 'javascript';
}

export function languageConfigForHistory(lang: string): LanguageConfig {
  const key = normalizeHistoryLanguage(lang);
  return DISPLAY_LANGUAGE_CONFIGS[key];
}

/** Persisted playground language or legacy keys → executor-supported id. */
export function coerceExecutableLanguage(raw: string | null): SupportedLanguage {
  if (raw === 'javascript' || raw === 'python' || raw === 'java') {
    return raw;
  }
  return 'javascript';
}

/** When loading a history row into the editor, only executable langs control Monaco + Run. */
export function executableLanguageFromHistory(lang: string): SupportedLanguage {
  const key = normalizeHistoryLanguage(lang);
  if (key === 'javascript' || key === 'python' || key === 'java') {
    return key;
  }
  return 'javascript';
}

export const DEFAULT_EDITOR_SETTINGS = {
  fontSize: 14,
  tabSize: 2,
  minimap: true,
  lineNumbers: true,
  wordWrap: false,
  theme: 'vs-dark' as const,
};

export const getLanguageConfig = (
  language: SupportedLanguage
): LanguageConfig => {
  return LANGUAGE_TEMPLATES[language];
};

export const getDefaultCode = (language: SupportedLanguage): string => {
  return LANGUAGE_TEMPLATES[language].defaultCode;
};
