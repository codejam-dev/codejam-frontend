'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, ChevronDown, Clock } from 'lucide-react';
import { RunHistoryItem, HistoryDisplayLanguage } from '@/types/playground.types';
import {
  languageConfigForHistory,
  normalizeHistoryLanguage,
} from '@/lib/language-templates';

export function runHistoryLanguage(lang: string): HistoryDisplayLanguage {
  return normalizeHistoryLanguage(lang);
}

function getFileNameForRun(lang: string): string {
  const key = normalizeHistoryLanguage(lang);
  const ext = languageConfigForHistory(lang).extension ?? '.js';
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

function firstLine(text: string | null | undefined): string {
  if (!text?.trim()) return '';
  const line = text.trim().split(/\r?\n/)[0] ?? '';
  return line.length > 120 ? `${line.slice(0, 117)}…` : line;
}

function firstLines(text: string, maxLines: number): string {
  const lines = text.split(/\r?\n/).slice(0, maxLines);
  return lines.join('\n');
}

function RunHistoryExpandableList({
  runs,
  isLoading,
  onRestoreCode,
  compact,
}: {
  runs: RunHistoryItem[];
  isLoading: boolean;
  onRestoreCode: (run: RunHistoryItem) => void;
  compact?: boolean;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showFullCode, setShowFullCode] = useState(false);

  useEffect(() => {
    setShowFullCode(false);
  }, [expandedId]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12 text-zinc-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-8 text-center text-sm text-zinc-500">
        No runs yet. Execute code to see history here.
      </div>
    );
  }

  return (
    <ul className={`flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto ${compact ? 'px-2 py-2' : 'px-3 py-3'}`}>
      {runs.map((run) => {
        const langConfig = languageConfigForHistory(run.language);
        const success = isSuccess(run.status);
        const expanded = expandedId === run.id;
        const timeMs = run.executionTimeMs;
        const exit = run.exitCode;
        const stderrLine = firstLine(run.stderr ?? run.errorMessage);
        const stdoutLine = firstLine(run.stdout);

        const secondLineSuccess =
          timeMs != null && exit != null
            ? `${timeMs} ms · exit ${exit}${stdoutLine ? ` · ${stdoutLine}` : ''}`
            : [timeMs != null ? `${timeMs} ms` : null, exit != null ? `exit ${exit}` : null, stdoutLine || null]
                .filter(Boolean)
                .join(' · ');

        return (
          <li key={run.id}>
            <div
              className={`overflow-hidden rounded-xl border transition-colors ${
                expanded
                  ? 'border-violet-500/40 bg-zinc-900/90'
                  : 'border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700'
              }`}
            >
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpandedId(expanded ? null : run.id)}
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${success ? 'bg-emerald-500' : 'bg-red-500'}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-xs font-medium text-zinc-200">{getFileNameForRun(run.language)}</span>
                    <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                      {langConfig?.name ?? run.language}
                    </span>
                    <span className="ml-auto flex shrink-0 items-center gap-1 text-[10px] text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {formatRunDate(run.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] leading-snug text-zinc-500">
                    {success ? (
                      <span>{secondLineSuccess || 'No output preview'}</span>
                    ) : (
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-400">
                          error
                        </span>
                        <span className="truncate text-red-300/90">{stderrLine || 'Run failed'}</span>
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`mt-1 h-4 w-4 shrink-0 text-zinc-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-zinc-800/80"
                  >
                    <div className="space-y-3 px-3 pb-3 pt-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-2">
                          <p className="text-[9px] font-medium uppercase tracking-wide text-zinc-500">Runtime</p>
                          <p className="mt-0.5 text-sm font-semibold text-violet-300">
                            {timeMs != null ? `${timeMs}` : '—'}
                            {timeMs != null && <span className="text-[10px] font-normal text-zinc-500"> ms</span>}
                          </p>
                        </div>
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-2">
                          <p className="text-[9px] font-medium uppercase tracking-wide text-zinc-500">Memory</p>
                          <p className="mt-0.5 text-sm font-semibold text-pink-300">
                            {run.memoryMb != null ? (
                              <>
                                {run.memoryMb.toFixed(1)}
                                <span className="text-[10px] font-normal text-zinc-500"> MB</span>
                              </>
                            ) : (
                              '—'
                            )}
                          </p>
                        </div>
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-2">
                          <p className="text-[9px] font-medium uppercase tracking-wide text-zinc-500">Exit</p>
                          <p className="mt-0.5 text-sm font-semibold text-zinc-200">{exit ?? '—'}</p>
                        </div>
                      </div>

                      {run.stdout?.trim() ? (
                        <div>
                          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">Stdout</p>
                          <pre className="max-h-16 overflow-hidden rounded-md border border-zinc-800 bg-[#14141a] px-2 py-1.5 font-mono text-[11px] leading-relaxed text-emerald-300/90">
                            {firstLines(run.stdout, 2)}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-600">No stdout</p>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestoreCode(run);
                        }}
                        className="w-full rounded-lg border border-violet-500/35 bg-violet-500/10 py-2 text-center text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/20"
                      >
                        ↩ Restore code
                      </button>

                      <div className="border-t border-dashed border-zinc-700/60 pt-3">
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">Source</p>
                        {showFullCode ? (
                          <pre className="max-h-48 overflow-auto rounded-md border border-zinc-800 bg-[#14141a] p-2 font-mono text-[11px] text-zinc-300">
                            <code>{run.code}</code>
                          </pre>
                        ) : (
                          <pre className="max-h-20 overflow-hidden rounded-md border border-zinc-800 bg-[#14141a] p-2 font-mono text-[11px] text-zinc-400">
                            <code>{firstLines(run.code, 4)}</code>
                          </pre>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFullCode((v) => !v);
                          }}
                          className="mt-1.5 text-[11px] font-medium text-violet-400 hover:text-violet-300"
                        >
                          {showFullCode ? 'Show less' : 'View full ›'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Embedded history (desktop side panel) — single column expandable cards */
export function RunHistoryTabContent({
  runs,
  isLoading,
  onRestoreCode,
}: {
  runs: RunHistoryItem[];
  isLoading: boolean;
  onRestoreCode: (run: RunHistoryItem) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <RunHistoryExpandableList runs={runs} isLoading={isLoading} onRestoreCode={onRestoreCode} compact />
    </motion.div>
  );
}

export interface RunHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  runs: RunHistoryItem[];
  isLoading: boolean;
  onRestoreCode: (run: RunHistoryItem) => void;
}

export default function RunHistoryPanel({
  isOpen,
  onClose,
  runs,
  isLoading,
  onRestoreCode,
}: RunHistoryPanelProps) {
  const handleRestore = (run: RunHistoryItem) => {
    onRestoreCode(run);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed bottom-0 right-0 top-0 z-[9999] flex w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-4 py-3">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-violet-400" />
                <h2 className="text-base font-semibold text-white">Run history</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <RunHistoryExpandableList runs={runs} isLoading={isLoading} onRestoreCode={handleRestore} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
