'use client';

import { CodeExecutionResponse } from '@/types/playground.types';
import { Clock, Cpu, CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExecutionMetricsProps {
  output: CodeExecutionResponse;
}

/** Compact chip row (e.g. legacy status strip) */
export default function ExecutionMetrics({ output }: ExecutionMetricsProps) {
  const isSuccess = output.exitCode === 0 && !output.error;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 rounded-lg border border-gray-700/30 bg-gray-800/40 px-3 py-1.5"
    >
      {isSuccess ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 text-red-400" />
      )}

      <div className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-violet-400" />
        <span className="text-xs font-semibold text-violet-400">{output.executionTime}ms</span>
      </div>

      {output.memory != null && (
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-pink-400" />
          <span className="text-xs font-semibold text-pink-400">{output.memory.toFixed(2)}MB</span>
        </div>
      )}
    </motion.div>
  );
}

interface ExecutionMetricsCardsProps {
  output: CodeExecutionResponse | null;
  isExecuting: boolean;
}

/** Sidebar: runtime / memory / exit code cards */
export function ExecutionMetricsCards({ output, isExecuting }: ExecutionMetricsCardsProps) {
  if (isExecuting) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        <p className="text-xs text-gray-500">Measuring metrics…</p>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
        <Activity className="h-10 w-10 text-violet-500/20" />
        <p className="text-xs text-gray-500">Run code to see runtime, memory, and exit code.</p>
      </div>
    );
  }

  const isSuccess = output.exitCode === 0 && !output.error;

  return (
    <div className="space-y-3 px-1 py-2">
      <div
        className={`rounded-lg border p-3 ${
          isSuccess ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isSuccess ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            )}
            <span className="text-xs font-medium text-white">Exit code</span>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {output.exitCode}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-gray-700/40 bg-gray-800/40 p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Runtime</span>
          </div>
          <p className="text-lg font-bold text-violet-400">
            {output.executionTime}
            <span className="ml-0.5 text-[10px] font-normal text-gray-500">ms</span>
          </p>
        </div>
        <div className="rounded-lg border border-gray-700/40 bg-gray-800/40 p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-pink-400" />
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Memory</span>
          </div>
          <p className="text-lg font-bold text-pink-400">
            {output.memory != null ? output.memory.toFixed(1) : '—'}
            {output.memory != null && (
              <span className="ml-0.5 text-[10px] font-normal text-gray-500">MB</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
