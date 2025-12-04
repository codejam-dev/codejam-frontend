'use client';

import { CodeExecutionResponse } from '@/types/playground.types';
import { Terminal, X, Clock, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OutputPanelProps {
  output: CodeExecutionResponse | null;
  isExecuting: boolean;
  onClear: () => void;
}

export default function OutputPanel({ output, isExecuting, onClear }: OutputPanelProps) {
  const hasOutput = output && (output.stdout || output.stderr || output.error);

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-white">Output</span>
        </div>

        {hasOutput && !isExecuting && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClear}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            title="Clear output"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          {isExecuting ? (
            <ExecutingState key="executing" />
          ) : hasOutput ? (
            <OutputContent key="output" output={output} />
          ) : (
            <EmptyState key="empty" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExecutingState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center h-full gap-4"
    >
      <div className="relative">
        <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <div className="absolute inset-0 blur-xl bg-violet-500/20 rounded-full animate-pulse" />
      </div>
      <div className="text-center">
        <p className="text-white font-medium mb-1">Executing code...</p>
        <p className="text-gray-400 text-sm">Please wait while we run your code</p>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center h-full gap-4 text-gray-500"
    >
      <div className="relative">
        <Terminal className="w-16 h-16 opacity-20" />
        <div className="absolute inset-0 blur-2xl bg-gray-500/5 rounded-full" />
      </div>
      <div className="text-center">
        <p className="text-gray-400 font-medium mb-1">No output yet</p>
        <p className="text-gray-500 text-sm">
          Press <kbd className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs">Ctrl+Enter</kbd> or click Run to execute your code
        </p>
      </div>
    </motion.div>
  );
}

function OutputContent({ output }: { output: CodeExecutionResponse }) {
  const hasStdout = output.stdout && output.stdout.trim().length > 0;
  const hasStderr = output.stderr && output.stderr.trim().length > 0;
  const hasError = output.error && output.error.trim().length > 0;
  const isSuccess = output.exitCode === 0 && !hasError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Status Badge */}
      <div className="flex items-center gap-3">
        {isSuccess ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Success</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">Error (Exit Code: {output.exitCode})</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
          <Clock className="w-3.5 h-3.5" />
          <span>{output.executionTime}ms</span>
        </div>

        {output.memory && (
          <div className="text-gray-400 text-xs">
            Memory: {output.memory.toFixed(2)} MB
          </div>
        )}
      </div>

      {/* Standard Output */}
      {hasStdout && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-green-500/50 to-transparent" />
            <span className="text-xs text-green-400 font-medium uppercase tracking-wider">stdout</span>
            <div className="h-px flex-1 bg-gradient-to-l from-green-500/50 to-transparent" />
          </div>
          <pre className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-sm text-green-400 font-mono overflow-x-auto whitespace-pre-wrap break-words">
            {output.stdout}
          </pre>
        </div>
      )}

      {/* Standard Error */}
      {hasStderr && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-red-500/50 to-transparent" />
            <span className="text-xs text-red-400 font-medium uppercase tracking-wider">stderr</span>
            <div className="h-px flex-1 bg-gradient-to-l from-red-500/50 to-transparent" />
          </div>
          <pre className="bg-gray-800/50 border border-red-700/50 rounded-lg p-4 text-sm text-red-400 font-mono overflow-x-auto whitespace-pre-wrap break-words">
            {output.stderr}
          </pre>
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-orange-500/50 to-transparent" />
            <span className="text-xs text-orange-400 font-medium uppercase tracking-wider">error</span>
            <div className="h-px flex-1 bg-gradient-to-l from-orange-500/50 to-transparent" />
          </div>
          <pre className="bg-gray-800/50 border border-orange-700/50 rounded-lg p-4 text-sm text-orange-400 font-mono overflow-x-auto whitespace-pre-wrap break-words">
            {output.error}
          </pre>
        </div>
      )}
    </motion.div>
  );
}
