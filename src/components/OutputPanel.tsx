'use client';

import { CodeExecutionResponse } from '@/types/playground.types';
import { Terminal, X, Clock, AlertCircle, CheckCircle2, Trash2, Copy, Zap, Cpu, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface OutputPanelProps {
  output: CodeExecutionResponse | null;
  isExecuting: boolean;
  onClear: () => void;
}

type OutputTab = 'stdout' | 'stderr' | 'metrics';

export default function OutputPanel({ output, isExecuting, onClear }: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<OutputTab>('stdout');
  const [copied, setCopied] = useState(false);
  const hasOutput = output && (output.stdout || output.stderr || output.error);

  // Auto-select appropriate tab when output arrives
  useEffect(() => {
    if (output) {
      if (output.stderr && output.stderr.trim().length > 0) {
        setActiveTab('stderr');
      } else if (output.stdout && output.stdout.trim().length > 0) {
        setActiveTab('stdout');
      }
    }
  }, [output]);

  const handleCopy = async () => {
    if (!output) return;
    
    let textToCopy = '';
    if (activeTab === 'stdout' && output.stdout) {
      textToCopy = output.stdout;
    } else if (activeTab === 'stderr' && output.stderr) {
      textToCopy = output.stderr;
    } else if (activeTab === 'metrics') {
      textToCopy = `Execution Time: ${output.executionTime}ms\nMemory: ${output.memory?.toFixed(2) || 'N/A'} MB\nExit Code: ${output.exitCode}`;
    }

    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getOutputText = () => {
    if (!output) return '';
    if (activeTab === 'stdout') return output.stdout || '';
    if (activeTab === 'stderr') return output.stderr || output.error || '';
    return '';
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-l border-gray-800/50 relative overflow-hidden">
      {/* Terminal-style background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 92, 246, 0.03) 2px, rgba(139, 92, 246, 0.03) 4px)',
        }} />
      </div>

      {/* Header with Tabs */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 border-b border-gray-800/50 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-1">
          {/* Tab: STDOUT */}
          <button
            onClick={() => setActiveTab('stdout')}
            className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-t-lg ${
              activeTab === 'stdout'
                ? 'text-green-400 bg-[#0d1117] border-t border-x border-gray-800/50'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>STDOUT</span>
              {output?.stdout && output.stdout.trim().length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                  {output.stdout.split('\n').filter(l => l.trim()).length}
                </span>
              )}
            </div>
            {activeTab === 'stdout' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400"
                layoutId="activeTab"
              />
            )}
          </button>

          {/* Tab: STDERR */}
          <button
            onClick={() => setActiveTab('stderr')}
            className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-t-lg ${
              activeTab === 'stderr'
                ? 'text-red-400 bg-[#0d1117] border-t border-x border-gray-800/50'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>STDERR</span>
              {((output?.stderr && output.stderr.trim().length > 0) || (output?.error && output.error.trim().length > 0)) && (
                <span className="px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                  {(output.stderr?.split('\n').filter(l => l.trim()).length || 0) + (output.error?.split('\n').filter(l => l.trim()).length || 0)}
                </span>
              )}
            </div>
            {activeTab === 'stderr' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-400"
                layoutId="activeTab"
              />
            )}
          </button>

          {/* Tab: METRICS */}
          <button
            onClick={() => setActiveTab('metrics')}
            className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-t-lg ${
              activeTab === 'metrics'
                ? 'text-violet-400 bg-[#0d1117] border-t border-x border-gray-800/50'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              <span>METRICS</span>
            </div>
            {activeTab === 'metrics' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400"
                layoutId="activeTab"
              />
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {hasOutput && !isExecuting && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all border border-transparent hover:border-gray-700/50"
                title="Copy output"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClear}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all border border-transparent hover:border-gray-700/50"
                title="Clear output"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto relative z-10">
        <AnimatePresence mode="wait">
          {isExecuting ? (
            <ExecutingState key="executing" />
          ) : hasOutput ? (
            activeTab === 'metrics' ? (
              <MetricsContent key="metrics" output={output} />
            ) : (
              <OutputContent key="output" output={output} activeTab={activeTab} />
            )
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
        <motion.div
          className="w-24 h-24 border-4 border-violet-500/20 border-t-violet-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 border-4 border-pink-500/20 border-b-pink-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 blur-2xl bg-violet-500/30 rounded-full animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Cpu className="w-8 h-8 text-violet-400" />
        </div>
      </div>

      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
          <p className="text-white font-medium text-lg">
            Executing code{dots}
          </p>
        </div>
        <p className="text-gray-400 text-sm">Compiling and running your code</p>
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
          Press <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-violet-300">Ctrl+Enter</kbd> or click <span className="text-violet-400 font-semibold">Run</span> to see the output
        </p>
      </div>
    </motion.div>
  );
}

function OutputContent({ output, activeTab }: { output: CodeExecutionResponse; activeTab: OutputTab }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);

  const text = activeTab === 'stdout' 
    ? (output.stdout || '') 
    : (output.stderr || output.error || '');

  useEffect(() => {
    if (!text) return;
    
    const lines = text.split('\n');
    setDisplayedLines([]);
    setIsStreaming(true);

    lines.forEach((line, index) => {
      setTimeout(() => {
        setDisplayedLines(prev => [...prev, line]);
        if (index === lines.length - 1) {
          setIsStreaming(false);
        }
      }, index * 30); // 30ms delay per line for smooth streaming
    });
  }, [text, activeTab]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayedLines]);

  const isSuccess = output.exitCode === 0 && !output.error;
  const colorClass = activeTab === 'stdout' 
    ? (isSuccess ? 'text-green-400' : 'text-yellow-400')
    : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col"
    >
      {/* Status Banner */}
      <div className="px-4 pt-4 pb-2">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${
            isSuccess
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          {isSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-sm font-semibold text-green-400">Execution Successful</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm font-semibold text-red-400">Error (Exit Code: {output.exitCode})</span>
            </>
          )}
        </motion.div>
      </div>

      {/* Output Content with Streaming Animation */}
      <div
        ref={contentRef}
        className="flex-1 overflow-auto px-4 pb-4"
      >
        <pre className={`font-mono text-sm leading-relaxed ${colorClass}`}>
          {displayedLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-0.5"
            >
              {line}
              {index === displayedLines.length - 1 && isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="ml-1"
                >
                  ▊
                </motion.span>
              )}
            </motion.div>
          ))}
          {!isStreaming && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="ml-1"
            >
              ▊
            </motion.span>
          )}
        </pre>
      </div>
    </motion.div>
  );
}

function MetricsContent({ output }: { output: CodeExecutionResponse }) {
  const isSuccess = output.exitCode === 0 && !output.error;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 space-y-6"
    >
      {/* Status Card */}
      <div className={`p-5 rounded-xl border ${
        isSuccess
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-red-500/10 border-red-500/30'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          {isSuccess ? (
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-400" />
          )}
          <h3 className="text-lg font-semibold text-white">Execution Status</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Exit Code:</span>
          <span className={`text-lg font-bold ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
            {output.exitCode}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Execution Time */}
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-violet-400" />
            <span className="text-sm font-semibold text-gray-300">Execution Time</span>
          </div>
          <div className="text-2xl font-bold text-violet-400">{output.executionTime}</div>
          <div className="text-xs text-gray-500 mt-1">milliseconds</div>
        </div>

        {/* Memory Usage */}
        {output.memory && (
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-pink-400" />
              <span className="text-sm font-semibold text-gray-300">Memory Usage</span>
            </div>
            <div className="text-2xl font-bold text-pink-400">{output.memory.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">megabytes</div>
          </div>
        )}
      </div>

      {/* Timeline Visualization */}
      <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Execution Timeline</h4>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500"
            />
          </div>
          <span className="text-xs text-gray-500">{output.executionTime}ms</span>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-gradient-to-br from-violet-500/10 to-pink-500/10 rounded-xl border border-violet-500/20">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-violet-400">Compiled</span> in {Math.floor(output.executionTime * 0.3)}ms
          {' → '}
          <span className="font-semibold text-pink-400">Ran</span> in {Math.floor(output.executionTime * 0.7)}ms
          {output.memory && (
            <>
              {' → '}
              <span className="font-semibold text-cyan-400">Memory</span> {output.memory.toFixed(2)} MB
            </>
          )}
        </p>
      </div>
    </motion.div>
  );
}
