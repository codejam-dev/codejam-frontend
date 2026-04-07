'use client';

import { CodeExecutionResponse, ConsoleWorkspaceTab } from '@/types/playground.types';
import ExecutionConsole, { type ConsoleMessage } from '@/features/playground/components/ExecutionConsole';
import { ExecutionMetricsCards } from './ExecutionMetrics';

export interface OutputPanelProps {
  output: CodeExecutionResponse | null;
  isExecuting: boolean;
  onClear: () => void;
  activeConsoleTab: ConsoleWorkspaceTab;
  onConsoleTabChange: (tab: ConsoleWorkspaceTab) => void;
  consoleMessages: ConsoleMessage[];
  onClearConsole: () => void;
  outputAutoScrollTail: boolean;
  onOutputAutoScrollTailChange: (enabled: boolean) => void;
  /** Editor stacked above (mobile vertical split): top border, flexible metrics height */
  stacked?: boolean;
}

export default function OutputPanel({
  output,
  isExecuting,
  onClear,
  activeConsoleTab,
  onConsoleTabChange,
  consoleMessages,
  onClearConsole,
  outputAutoScrollTail,
  onOutputAutoScrollTailChange,
  stacked = false,
}: OutputPanelProps) {
  return (
    <div
      className={`relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#0d1117] ${
        stacked ? 'border-t border-gray-800/50' : 'border-l border-gray-800/50'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgb(139_92_246/0.08)_2px,rgb(139_92_246/0.08)_4px)]" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <ExecutionConsole
          output={output}
          isExecuting={isExecuting}
          onClear={onClear}
          isCollapsed={false}
          onToggleCollapse={() => {}}
          activeTab={activeConsoleTab}
          onActiveTabChange={onConsoleTabChange}
          expandedHeightPx={320}
          consoleMessages={consoleMessages}
          onClearConsole={onClearConsole}
          embedded
          outputAutoScrollTail={outputAutoScrollTail}
          onOutputAutoScrollTailChange={onOutputAutoScrollTailChange}
        />

        <div className="shrink-0 border-t border-dashed border-zinc-600/50" />

        <div
          className={`flex shrink-0 flex-col overflow-hidden border-t border-gray-800/50 bg-gray-950/40 ${
            stacked
              ? 'max-h-[38%] min-h-[64px]'
              : 'max-h-[min(42vh,320px)] min-h-[140px]'
          }`}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <ExecutionMetricsCards output={output} isExecuting={isExecuting} />
            <p className="px-3 pb-3 pt-1 text-center text-[10px] leading-relaxed text-zinc-600">
              Preview · Collab — coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
