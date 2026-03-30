'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { History, X, CheckCircle2, XCircle, Clock, FileCode } from 'lucide-react';
import { RunHistoryItem } from '@/types/playground.types';
import { LANGUAGE_TEMPLATES, SUPPORTED_LANGUAGES } from '@/lib/language-templates';
import type { SupportedLanguage } from '@/types/playground.types';

function getLanguageKey(lang: string): SupportedLanguage {
  const lower = lang?.toLowerCase() ?? 'javascript';
  if (SUPPORTED_LANGUAGES.includes(lower as SupportedLanguage)) {
    return lower as SupportedLanguage;
  }
  return 'javascript';
}

function getFileNameForRun(lang: string): string {
  const key = getLanguageKey(lang);
  const ext = LANGUAGE_TEMPLATES[key]?.extension ?? '.js';
  return key === 'java' ? `Main${ext}` : `main${ext}`;
}

function formatRunDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function isSuccess(status: string): boolean {
  return status === 'SUCCESS';
}

export interface RunHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  runs: RunHistoryItem[];
  isLoading: boolean;
  selectedRun: RunHistoryItem | null;
  onSelectRun: (run: RunHistoryItem | null) => void;
}

export default function RunHistoryPanel({
  isOpen,
  onClose,
  runs,
  isLoading,
  selectedRun,
  onSelectRun,
}: RunHistoryPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-gray-900 border-l border-gray-700 shadow-2xl z-[9999] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800/80">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-white">Run History</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : runs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-500 px-6">
                  <p className="text-center">No runs yet. Execute code to see history here.</p>
                </div>
              ) : (
                <div className="flex-1 flex min-h-0">
                  {/* List */}
                  <div className="w-72 flex-shrink-0 border-r border-gray-700 overflow-y-auto">
                    <ul className="p-2 space-y-1">
                      {runs.map((run) => {
                        const langKey = getLanguageKey(run.language);
                        const langConfig = LANGUAGE_TEMPLATES[langKey];
                        const success = isSuccess(run.status);
                        const Icon = typeof langConfig?.icon === 'function' ? langConfig.icon : null;
                        return (
                          <li key={run.id}>
                            <button
                              type="button"
                              onClick={() => onSelectRun(selectedRun?.id === run.id ? null : run)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors border ${
                                selectedRun?.id === run.id
                                  ? 'bg-violet-500/20 border-violet-500/50 text-white'
                                  : 'border-transparent hover:bg-gray-800 text-gray-300 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                {Icon && (
                                  <span className="flex-shrink-0" style={{ color: langConfig.iconColor }}>
                                    <Icon className="w-4 h-4" />
                                  </span>
                                )}
                                <span className="text-xs font-medium truncate">
                                  {getFileNameForRun(run.language)}
                                </span>
                                {success ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <span>{langConfig?.name ?? run.language}</span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatRunDate(run.createdAt)}
                                </span>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Detail: code + output */}
                  <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {selectedRun ? (
                      <>
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700 bg-gray-800/50">
                          <FileCode className="w-4 h-4 text-violet-400" />
                          <span className="text-sm font-medium text-gray-300">
                            {getFileNameForRun(selectedRun.language)} — {formatRunDate(selectedRun.createdAt)}
                          </span>
                          {isSuccess(selectedRun.status) ? (
                            <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                              Success
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                              {selectedRun.status}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 overflow-auto p-4 space-y-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              Code
                            </p>
                            <pre className="p-4 bg-[#1e1e1e] rounded-lg border border-gray-700 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono">
                              <code>{selectedRun.code}</code>
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              Output
                            </p>
                            <div className="space-y-2">
                              {selectedRun.stdout && (
                                <pre className="p-4 bg-[#1e1e1e] rounded-lg border border-gray-700 text-sm text-green-300 overflow-x-auto whitespace-pre-wrap font-mono">
                                  {selectedRun.stdout}
                                </pre>
                              )}
                              {(selectedRun.stderr || selectedRun.errorMessage) && (
                                <pre className="p-4 bg-red-950/30 rounded-lg border border-red-900/50 text-sm text-red-300 overflow-x-auto whitespace-pre-wrap font-mono">
                                  {selectedRun.stderr || selectedRun.errorMessage || ''}
                                </pre>
                              )}
                              {!selectedRun.stdout && !selectedRun.stderr && !selectedRun.errorMessage && (
                                <p className="text-gray-500 text-sm">No output</p>
                              )}
                              {selectedRun.executionTimeMs != null && (
                                <p className="text-xs text-gray-500">
                                  Execution time: {selectedRun.executionTimeMs} ms
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                        Click a run to view code and output
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
