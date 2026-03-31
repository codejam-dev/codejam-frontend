'use client';

import { CodeExecutionResponse } from '@/types/playground.types';
import { 
  Activity, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Monitor, 
  Users, 
  Zap,
  BarChart3,
  TrendingUp,
  Gauge,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface OutputPanelProps {
  output: CodeExecutionResponse | null;
  isExecuting: boolean;
  onClear: () => void;
}

type PanelTab = 'metrics' | 'preview' | 'collaboration';

export default function OutputPanel({ output, isExecuting, onClear }: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('metrics');

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-l border-gray-800/50 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 92, 246, 0.03) 2px, rgba(139, 92, 246, 0.03) 4px)',
        }} />
      </div>

      {/* Header with Tabs */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 border-b border-gray-800/50 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-1">
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
              <span>Metrics</span>
              {output && (
                <span className="px-1.5 py-0.5 text-xs bg-violet-500/20 text-violet-400 rounded">
                  {output.exitCode === 0 ? 'OK' : 'ERR'}
                </span>
              )}
            </div>
            {activeTab === 'metrics' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-cyan-400 to-pink-500"
                layoutId="panelActiveTab"
              />
            )}
          </button>

          {/* Tab: PREVIEW (Coming Soon) */}
          <button
            onClick={() => setActiveTab('preview')}
            className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-t-lg ${
              activeTab === 'preview'
                ? 'text-cyan-400 bg-[#0d1117] border-t border-x border-gray-800/50'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5" />
              <span>Preview</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-400 rounded font-semibold">
                SOON
              </span>
            </div>
            {activeTab === 'preview' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-blue-400 to-violet-500"
                layoutId="panelActiveTab"
              />
            )}
          </button>

          {/* Tab: COLLABORATION (Coming Soon) */}
          <button
            onClick={() => setActiveTab('collaboration')}
            className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-t-lg ${
              activeTab === 'collaboration'
                ? 'text-pink-400 bg-[#0d1117] border-t border-x border-gray-800/50'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              <span>Collab</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-pink-500/20 text-pink-400 rounded font-semibold">
                SOON
              </span>
            </div>
            {activeTab === 'collaboration' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 via-rose-400 to-violet-500"
                layoutId="panelActiveTab"
              />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'metrics' && (
            <MetricsPanel 
              key="metrics" 
              output={output} 
              isExecuting={isExecuting} 
            />
          )}
          {activeTab === 'preview' && (
            <PreviewPlaceholder key="preview" />
          )}
          {activeTab === 'collaboration' && (
            <CollaborationPlaceholder key="collaboration" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MetricsPanel({ output, isExecuting }: { output: CodeExecutionResponse | null; isExecuting: boolean }) {
  if (isExecuting) {
    return <ExecutingState />;
  }

  if (!output) {
    return <EmptyMetricsState />;
  }

  const isSuccess = output.exitCode === 0 && !output.error;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-5 space-y-5 h-full overflow-auto"
    >
      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-4 rounded-xl border ${
          isSuccess
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSuccess ? (
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
            ) : (
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-white">
                {isSuccess ? 'Execution Successful' : 'Execution Failed'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Exit code: {output.exitCode}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
            isSuccess 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {isSuccess ? 'PASS' : 'FAIL'}
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Execution Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/40 hover:border-violet-500/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-violet-500/20 rounded-lg">
              <Timer className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-xs font-medium text-gray-400">Runtime</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-violet-400">{output.executionTime}</span>
            <span className="text-xs text-gray-500">ms</span>
          </div>
          <div className="mt-2 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(output.executionTime / 10, 100)}%` }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-violet-500 to-violet-400"
            />
          </div>
        </motion.div>

        {/* Memory Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/40 hover:border-pink-500/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-pink-500/20 rounded-lg">
              <Cpu className="w-4 h-4 text-pink-400" />
            </div>
            <span className="text-xs font-medium text-gray-400">Memory</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-pink-400">
              {output.memory ? output.memory.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-gray-500">MB</span>
          </div>
          <div className="mt-2 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((output.memory || 0) / 2.56, 100)}%` }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="h-full bg-gradient-to-r from-pink-500 to-pink-400"
            />
          </div>
        </motion.div>
      </div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-gradient-to-br from-gray-800/40 to-gray-800/20 rounded-xl border border-gray-700/40"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">Performance Breakdown</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <span className="text-xs text-gray-400">Compilation</span>
            </div>
            <span className="text-xs font-medium text-violet-400">
              ~{Math.floor(output.executionTime * 0.3)}ms
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-400" />
              <span className="text-xs text-gray-400">Execution</span>
            </div>
            <span className="text-xs font-medium text-pink-400">
              ~{Math.floor(output.executionTime * 0.7)}ms
            </span>
          </div>
          {output.memory && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-xs text-gray-400">Peak Memory</span>
              </div>
              <span className="text-xs font-medium text-cyan-400">
                {output.memory.toFixed(2)}MB
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30"
      >
        <Gauge className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-400">
          Performance score: 
          <span className={`ml-1 font-semibold ${
            output.executionTime < 100 ? 'text-green-400' : 
            output.executionTime < 500 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {output.executionTime < 100 ? 'Excellent' : 
             output.executionTime < 500 ? 'Good' : 'Needs optimization'}
          </span>
        </span>
      </motion.div>
    </motion.div>
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
      className="flex flex-col items-center justify-center h-full gap-6 p-6"
    >
      <div className="relative">
        <motion.div
          className="w-20 h-20 border-4 border-violet-500/20 border-t-violet-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-3 border-4 border-pink-500/20 border-b-pink-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 blur-2xl bg-violet-500/20 rounded-full animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Cpu className="w-6 h-6 text-violet-400" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
          <p className="text-white font-medium">
            Running{dots}
          </p>
        </div>
        <p className="text-gray-500 text-xs">Measuring performance metrics</p>
      </div>
    </motion.div>
  );
}

function EmptyMetricsState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 p-6"
    >
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Activity className="w-16 h-16 opacity-20 text-violet-500" />
        </motion.div>
        <div className="absolute inset-0 blur-3xl bg-violet-500/10 rounded-full animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-gray-400 font-medium">No execution data</p>
        <p className="text-gray-500 text-xs max-w-[200px]">
          Run your code to see performance metrics and insights
        </p>
      </div>
    </motion.div>
  );
}

function PreviewPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center h-full gap-6 p-6"
    >
      <div className="relative">
        <div className="p-6 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
          <Monitor className="w-12 h-12 text-cyan-400/60" />
        </div>
        <motion.div
          className="absolute -top-2 -right-2 px-2 py-1 bg-cyan-500/20 rounded-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[10px] font-bold text-cyan-400">COMING SOON</span>
        </motion.div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-white font-semibold">Live Preview</h3>
        <p className="text-gray-500 text-sm max-w-[240px]">
          Preview your web applications and visualizations directly in the workspace
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        <span className="px-2.5 py-1 bg-gray-800/60 rounded-full text-xs text-gray-400 border border-gray-700/40">
          HTML/CSS/JS
        </span>
        <span className="px-2.5 py-1 bg-gray-800/60 rounded-full text-xs text-gray-400 border border-gray-700/40">
          React Components
        </span>
        <span className="px-2.5 py-1 bg-gray-800/60 rounded-full text-xs text-gray-400 border border-gray-700/40">
          Data Visualizations
        </span>
      </div>
    </motion.div>
  );
}

function CollaborationPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center h-full gap-6 p-6"
    >
      <div className="relative">
        <div className="p-6 bg-pink-500/10 rounded-2xl border border-pink-500/20">
          <Users className="w-12 h-12 text-pink-400/60" />
        </div>
        <motion.div
          className="absolute -top-2 -right-2 px-2 py-1 bg-pink-500/20 rounded-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[10px] font-bold text-pink-400">COMING SOON</span>
        </motion.div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-white font-semibold">Real-time Collaboration</h3>
        <p className="text-gray-500 text-sm max-w-[240px]">
          Code together with teammates in real-time with live cursors and chat
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        <span className="px-2.5 py-1 bg-gray-800/60 rounded-full text-xs text-gray-400 border border-gray-700/40">
          Live Cursors
        </span>
        <span className="px-2.5 py-1 bg-gray-800/60 rounded-full text-xs text-gray-400 border border-gray-700/40">
          Voice Chat
        </span>
        <span className="px-2.5 py-1 bg-gray-800/60 rounded-full text-xs text-gray-400 border border-gray-700/40">
          Code Reviews
        </span>
      </div>
    </motion.div>
  );
}
