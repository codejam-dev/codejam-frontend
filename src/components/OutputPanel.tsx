'use client';

import { CodeExecutionResponse } from '@/types/playground.types';
import { Terminal, X, Clock, AlertCircle, CheckCircle2, Trash2, Zap, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface OutputPanelProps {
  output: CodeExecutionResponse | null;
  isExecuting: boolean;
  onClear: () => void;
}

export default function OutputPanel({ output, isExecuting, onClear }: OutputPanelProps) {
  const hasOutput = output && (output.stdout || output.stderr || output.error);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/10 border-l border-violet-500/20 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl floating-particle" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl floating-particle" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl floating-particle" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-violet-500/20 glass relative z-10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Terminal className="w-4 h-4 text-violet-400" />
            {isExecuting && (
              <motion.div
                className="absolute -inset-1 bg-violet-500/30 rounded-full blur"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <span className="text-sm font-medium text-white neon-glow">Output Console</span>
        </div>

        {hasOutput && !isExecuting && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClear}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-violet-500/20 rounded-md transition-all border border-transparent hover:border-violet-500/30"
            title="Clear output"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 relative z-10">
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
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center h-full gap-6"
    >
      <div className="relative">
        {/* Outer spinning ring */}
        <motion.div
          className="w-24 h-24 border-4 border-violet-500/20 border-t-violet-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner pulsing circle */}
        <motion.div
          className="absolute inset-4 border-4 border-pink-500/20 border-b-pink-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {/* Glow effect */}
        <div className="absolute inset-0 blur-2xl bg-violet-500/30 rounded-full animate-pulse" />
        {/* CPU icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Cpu className="w-8 h-8 text-violet-400" />
        </div>
      </div>

      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
          <p className="text-white font-medium text-lg neon-glow">
            Executing code{dots}
          </p>
        </div>
        <p className="text-gray-400 text-sm">Compiling and running your masterpiece</p>

        {/* Progress bars */}
        <div className="w-64 space-y-2 mt-4">
          <motion.div
            className="h-1 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
            animate={{ scaleX: [0, 1, 0], originX: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
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
        <motion.div
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Terminal className="w-20 h-20 opacity-20 text-violet-500" />
        </motion.div>
        <div className="absolute inset-0 blur-3xl bg-violet-500/10 rounded-full animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-gray-400 font-medium mb-1">Ready to execute</p>
        <p className="text-gray-500 text-sm max-w-xs">
          Press <kbd className="px-2 py-1 bg-gradient-to-br from-gray-800 to-gray-900 border border-violet-500/30 rounded text-xs shadow-lg shadow-violet-500/10 text-violet-300">Ctrl+Enter</kbd> or click <span className="text-violet-400 font-semibold">Run</span> to see the magic happen
        </p>
      </div>

      {/* Floating code symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {['{ }', '< />', '[ ]', '( )', '=>'].map((symbol, i) => (
          <motion.div
            key={i}
            className="absolute text-violet-500/30 font-mono text-2xl"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            {symbol}
          </motion.div>
        ))}
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
      className="space-y-4 slide-in"
    >
      {/* Status Badge */}
      <motion.div
        className="flex items-center gap-3 flex-wrap"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {isSuccess ? (
          <motion.div
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg shadow-lg shadow-green-500/20"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-sm font-bold text-green-400">Execution Successful</span>
          </motion.div>
        ) : (
          <motion.div
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 rounded-lg shadow-lg shadow-red-500/20"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-sm font-bold text-red-400">Error (Exit Code: {output.exitCode})</span>
          </motion.div>
        )}

        <motion.div
          className="flex items-center gap-2 px-3 py-2 glass rounded-lg"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Clock className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-gray-300">
            <span className="text-violet-400 font-bold">{output.executionTime}</span>ms
          </span>
        </motion.div>

        {output.memory && (
          <motion.div
            className="flex items-center gap-2 px-3 py-2 glass rounded-lg"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Cpu className="w-4 h-4 text-pink-400" />
            <span className="text-sm text-gray-300">
              <span className="text-pink-400 font-bold">{output.memory.toFixed(2)}</span> MB
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Standard Output */}
      {hasStdout && (
        <motion.div
          className="space-y-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-green-500/50 via-green-400/50 to-transparent" />
            <div className="flex items-center gap-2 px-3 py-1 glass rounded">
              <Terminal className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-bold uppercase tracking-wider">stdout</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-green-500/50 via-green-400/50 to-transparent" />
          </div>
          <motion.pre
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-green-500/30 rounded-lg p-4 text-sm text-green-400 font-mono overflow-x-auto whitespace-pre-wrap break-words shadow-lg shadow-green-500/10 relative backdrop-blur-sm"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 blur-2xl rounded-full" />
            {output.stdout}
            <span className="terminal-cursor">▊</span>
          </motion.pre>
        </motion.div>
      )}

      {/* Standard Error */}
      {hasStderr && (
        <motion.div
          className="space-y-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-red-500/50 via-red-400/50 to-transparent" />
            <div className="flex items-center gap-2 px-3 py-1 glass rounded">
              <AlertCircle className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-400 font-bold uppercase tracking-wider">stderr</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-red-500/50 via-red-400/50 to-transparent" />
          </div>
          <motion.pre
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-red-500/30 rounded-lg p-4 text-sm text-red-400 font-mono overflow-x-auto whitespace-pre-wrap break-words shadow-lg shadow-red-500/10 relative backdrop-blur-sm"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 blur-2xl rounded-full" />
            {output.stderr}
          </motion.pre>
        </motion.div>
      )}

      {/* Error Message */}
      {hasError && (
        <motion.div
          className="space-y-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-orange-500/50 via-orange-400/50 to-transparent" />
            <div className="flex items-center gap-2 px-3 py-1 glass rounded">
              <Zap className="w-3 h-3 text-orange-400" />
              <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">error</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-orange-500/50 via-orange-400/50 to-transparent" />
          </div>
          <motion.pre
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-orange-500/30 rounded-lg p-4 text-sm text-orange-400 font-mono overflow-x-auto whitespace-pre-wrap break-words shadow-lg shadow-orange-500/10 relative backdrop-blur-sm"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 blur-2xl rounded-full" />
            {output.error}
          </motion.pre>
        </motion.div>
      )}
    </motion.div>
  );
}
