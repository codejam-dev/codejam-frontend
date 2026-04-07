'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  Trash2,
  Terminal,
  AlertTriangle,
  Square,
  Loader2,
  ArrowDownToLine,
} from 'lucide-react';
import { useOutputPaneTailScroll } from '@/features/playground/hooks/useOutputPaneTailScroll';
import { CodeExecutionResponse, ConsoleWorkspaceTab } from '@/types/playground.types';
import { ExecutionMetricsCards } from '@/components/ExecutionMetrics';
import type { ConsoleMessage } from './ExecutionConsole';

const SHEET_MIN_VH = 45;
const SHEET_MAX_VH = 70;

interface MobileOutputDockProps {
  output: CodeExecutionResponse | null;
  isExecuting: boolean;
  onClear: () => void;
  activeTab: ConsoleWorkspaceTab;
  onTabChange: (tab: ConsoleWorkspaceTab) => void;
  consoleMessages: ConsoleMessage[];
  onClearConsole: () => void;
  /** Incremented when a run finishes; opens the output sheet and picks stdout vs stderr. */
  revealAfterRunTick?: number;
  outputAutoScrollTail: boolean;
  onOutputAutoScrollTailChange: (enabled: boolean) => void;
}

function stderrLineCount(output: CodeExecutionResponse | null): number {
  if (!output) return 0;
  const parts = [output.stderr, output.error].filter(Boolean).join('\n');
  if (!parts.trim()) return 0;
  return parts.split('\n').filter((l) => l.trim().length > 0).length;
}

function tabForRunResult(output: CodeExecutionResponse | null): ConsoleWorkspaceTab {
  if (!output) return 'stdout';
  const stderrText = [output.stderr, output.error].filter(Boolean).join('\n').trim();
  if (stderrText) return 'stderr';
  if (output.exitCode !== 0) return 'stderr';
  return 'stdout';
}

export default function MobileOutputDock({
  output,
  isExecuting,
  onClear,
  activeTab,
  onTabChange,
  consoleMessages,
  onClearConsole,
  revealAfterRunTick = 0,
  outputAutoScrollTail,
  onOutputAutoScrollTailChange,
}: MobileOutputDockProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetVh, setSheetVh] = useState(SHEET_MIN_VH);
  const [copied, setCopied] = useState(false);
  const dragStartVh = useRef(SHEET_MIN_VH);
  const dragStartY = useRef(0);
  const [resizing, setResizing] = useState(false);
  const outputRef = useRef(output);
  outputRef.current = output;

  const sheetScrollRef = useRef<HTMLDivElement>(null);

  const mobileTailScrollToken = useMemo(
    () =>
      [
        sheetOpen ? '1' : '0',
        activeTab,
        isExecuting,
        output?.stdout?.length ?? 0,
        output?.stderr?.length ?? 0,
        output?.error?.length ?? 0,
        consoleMessages.length,
        consoleMessages.at(-1)?.id ?? '',
      ].join('|'),
    [sheetOpen, activeTab, isExecuting, output, consoleMessages]
  );

  useOutputPaneTailScroll(sheetScrollRef, outputAutoScrollTail, mobileTailScrollToken);

  const stderrCount = stderrLineCount(output);

  const handleTabPress = (tab: ConsoleWorkspaceTab) => {
    if (sheetOpen && activeTab === tab) {
      setSheetOpen(false);
      return;
    }
    onTabChange(tab);
    setSheetVh(SHEET_MIN_VH);
    setSheetOpen(true);
  };

  const handleCopy = async () => {
    let text = '';
    if (activeTab === 'stdout') text = output?.stdout ?? '';
    else if (activeTab === 'stderr') text = [output?.stderr, output?.error].filter(Boolean).join('\n');
    else text = consoleMessages.map((m) => m.message).join('\n');
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (activeTab === 'console') onClearConsole();
    else onClear();
  };

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setResizing(true);
      dragStartVh.current = sheetVh;
      dragStartY.current = e.clientY;
      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        const dy = dragStartY.current - ev.clientY;
        const dvh = (dy / window.innerHeight) * 100;
        const next = Math.min(SHEET_MAX_VH, Math.max(SHEET_MIN_VH, dragStartVh.current + dvh));
        setSheetVh(next);
      };
      const onUp = (ev: PointerEvent) => {
        setResizing(false);
        el.releasePointerCapture(ev.pointerId);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [sheetVh]
  );

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  useEffect(() => {
    if (revealAfterRunTick === 0) return;
    onTabChange(tabForRunResult(outputRef.current));
    setSheetVh(SHEET_MIN_VH);
    setSheetOpen(true);
  }, [revealAfterRunTick, onTabChange]);

  const tabBtn = (tab: ConsoleWorkspaceTab, icon: React.ReactNode, title: string, badge?: number) => {
    const active = activeTab === tab && sheetOpen;
    return (
      <button
        type="button"
        title={title}
        onClick={() => handleTabPress(tab)}
        className={`relative flex h-9 w-9 shrink-0 snap-start items-center justify-center rounded-lg transition-colors ${
          active
            ? 'bg-violet-600/35 text-violet-200'
            : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
        }`}
      >
        {icon}
        {tab === 'stderr' && badge !== undefined && badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bottom-11 z-[38] bg-black/50"
            aria-hidden
            onClick={() => setSheetOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Output"
            initial={{ height: 0, opacity: 0.96 }}
            animate={{ height: `${sheetVh}vh`, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              resizing
                ? { duration: 0 }
                : { type: 'spring', damping: 32, stiffness: 380 }
            }
            className="absolute bottom-11 left-0 right-0 z-40 flex max-h-[70vh] flex-col overflow-hidden rounded-t-2xl border border-zinc-700/60 bg-[#0d1117] shadow-[0_-12px_40px_rgba(0,0,0,0.45)]"
          >
            <div
              className="flex shrink-0 cursor-row-resize touch-none items-center justify-center border-b border-zinc-700/50 bg-zinc-900/90 py-2"
              onPointerDown={onResizePointerDown}
            >
              <div className="h-1.5 w-12 rounded-full bg-zinc-500" />
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div
                ref={sheetScrollRef}
                className="min-h-0 flex-1 overflow-y-auto px-3 py-3"
              >
                {isExecuting && !output ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                    <span className="text-sm text-zinc-400">Executing…</span>
                  </div>
                ) : activeTab === 'stdout' ? (
                  output?.stdout ? (
                    <pre className="whitespace-pre-wrap break-words font-mono text-sm text-emerald-400">
                      {output.stdout}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500">
                      <Terminal className="mb-2 h-8 w-8 opacity-40" />
                      <p className="text-sm">No stdout yet</p>
                    </div>
                  )
                ) : activeTab === 'stderr' ? (
                  [output?.stderr, output?.error].filter(Boolean).join('\n') ? (
                    <pre className="whitespace-pre-wrap break-words font-mono text-sm text-red-400">
                      {[output?.stderr, output?.error].filter(Boolean).join('\n')}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500">
                      <AlertTriangle className="mb-2 h-8 w-8 opacity-40" />
                      <p className="text-sm">No stderr</p>
                    </div>
                  )
                ) : consoleMessages.length > 0 ? (
                  <div className="space-y-2">
                    {consoleMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-lg px-3 py-2 font-mono text-sm ${
                          msg.type === 'error'
                            ? 'bg-red-500/10 text-red-400'
                            : msg.type === 'warn'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : msg.type === 'info'
                                ? 'bg-blue-500/10 text-blue-400'
                                : 'bg-zinc-800/60 text-zinc-300'
                        }`}
                      >
                        <span className="mr-2 text-[10px] opacity-50">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                        {msg.message}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500">
                    <Square className="mb-2 h-8 w-8 opacity-40" />
                    <p className="text-sm">Console empty</p>
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-zinc-800/80 bg-zinc-950/80 px-2 py-2">
                <ExecutionMetricsCards output={output} isExecuting={isExecuting} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-50 flex h-11 min-h-11 shrink-0 items-center gap-2 border-t border-zinc-700/50 bg-zinc-900/95 px-1.5 backdrop-blur-md sm:px-2">
        <div className="flex min-h-0 min-w-0 flex-1 items-center gap-1 overflow-x-auto overscroll-x-contain py-0.5 pl-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabBtn(
            'stdout',
            <span className="font-mono text-sm font-semibold text-zinc-200">&gt;_</span>,
            'Standard output'
          )}
          {tabBtn(
            'stderr',
            <AlertTriangle className="h-[18px] w-[18px]" />,
            'Standard error',
            stderrCount
          )}
          {tabBtn('console', <Square className="h-[18px] w-[18px]" strokeWidth={2} />, 'Console')}
        </div>
        <div className="flex shrink-0 items-center gap-0.5 border-l border-zinc-700/50 py-0.5 pl-1.5 pr-0.5 sm:gap-1 sm:pl-2 sm:pr-1">
          {isExecuting && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-400" />}
          <button
            type="button"
            aria-pressed={outputAutoScrollTail}
            aria-label={
              outputAutoScrollTail
                ? 'Auto-scroll to end is on. Tap to keep scroll position when output updates.'
                : 'Auto-scroll to end is off. Tap to follow new output to the bottom.'
            }
            title={
              outputAutoScrollTail
                ? 'Auto-scroll to end: on'
                : 'Auto-scroll to end: off — tap to follow new output'
            }
            onClick={() => onOutputAutoScrollTailChange(!outputAutoScrollTail)}
            className={`flex h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold transition-colors ${
              outputAutoScrollTail
                ? 'bg-violet-600/25 text-violet-200'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <ArrowDownToLine className="h-3.5 w-3.5 shrink-0" />
            <span>Tail</span>
          </button>
          <button
            type="button"
            title="Copy"
            onClick={handleCopy}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            type="button"
            title="Clear"
            onClick={handleClear}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
