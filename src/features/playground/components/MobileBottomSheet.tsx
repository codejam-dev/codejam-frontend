'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import {
  X,
  ChevronUp,
  ChevronDown,
  Copy,
  Check,
  Trash2,
  Terminal,
  AlertCircle,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { CodeExecutionResponse } from '@/types/playground.types';
import type { ConsoleMessage } from './ExecutionConsole';

type TabType = 'stdout' | 'stderr' | 'console';

interface MobileBottomSheetProps {
  output: CodeExecutionResponse | null;
  isExecuting: boolean;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
  consoleMessages: ConsoleMessage[];
  onClearConsole: () => void;
}

const SHEET_HEIGHTS = {
  collapsed: 56,
  partial: 280,
  expanded: '85vh',
};

export default function MobileBottomSheet({
  output,
  isExecuting,
  onClear,
  isOpen,
  onToggle,
  consoleMessages,
  onClearConsole,
}: MobileBottomSheetProps) {
  const [activeTab, setActiveTab] = useState<TabType>('stdout');
  const [sheetHeight, setSheetHeight] = useState<'collapsed' | 'partial' | 'expanded'>('collapsed');
  const [copied, setCopied] = useState(false);
  const controls = useAnimation();
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-expand when output arrives
  useEffect(() => {
    if (output && sheetHeight === 'collapsed') {
      setSheetHeight('partial');
    }
  }, [output]);

  // Auto-switch to stderr if there are errors
  useEffect(() => {
    if (output?.stderr && output.stderr.trim()) {
      setActiveTab('stderr');
    } else if (output?.stdout) {
      setActiveTab('stdout');
    }
  }, [output]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity > 500 || offset > 100) {
      // Dragging down fast or far
      if (sheetHeight === 'expanded') {
        setSheetHeight('partial');
      } else {
        setSheetHeight('collapsed');
      }
    } else if (velocity < -500 || offset < -100) {
      // Dragging up fast or far
      if (sheetHeight === 'collapsed') {
        setSheetHeight('partial');
      } else {
        setSheetHeight('expanded');
      }
    }
  };

  const cycleHeight = () => {
    if (sheetHeight === 'collapsed') {
      setSheetHeight('partial');
    } else if (sheetHeight === 'partial') {
      setSheetHeight('expanded');
    } else {
      setSheetHeight('collapsed');
    }
  };

  const handleCopy = async () => {
    const content = activeTab === 'stdout' ? output?.stdout : 
                    activeTab === 'stderr' ? output?.stderr :
                    consoleMessages.map((m) => m.message).join('\n');
    
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getHeightValue = () => {
    switch (sheetHeight) {
      case 'collapsed':
        return SHEET_HEIGHTS.collapsed;
      case 'partial':
        return SHEET_HEIGHTS.partial;
      case 'expanded':
        return SHEET_HEIGHTS.expanded;
    }
  };

  const tabs: { id: TabType; label: string; icon: typeof Terminal }[] = [
    { id: 'stdout', label: 'Output', icon: Terminal },
    { id: 'stderr', label: 'Errors', icon: AlertCircle },
    { id: 'console', label: 'Console', icon: MessageSquare },
  ];

  const hasStderr = output?.stderr && output.stderr.trim();
  const hasStdout = output?.stdout && output.stdout.trim();
  const hasConsole = consoleMessages.length > 0;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-gray-900/98 backdrop-blur-xl border-t border-gray-700/50 rounded-t-2xl z-50 shadow-2xl"
      style={{ boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)' }}
      initial={{ height: SHEET_HEIGHTS.collapsed }}
      animate={{ height: getHeightValue() }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
    >
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Drag Handle */}
      <div 
        className="flex items-center justify-center py-2 cursor-grab active:cursor-grabbing"
        onClick={cycleHeight}
      >
        <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-gray-800/60 rounded-lg">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const hasContent = tab.id === 'stdout' ? hasStdout :
                                tab.id === 'stderr' ? hasStderr : hasConsole;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gray-700/80 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${
                    tab.id === 'stderr' && hasStderr ? 'text-red-400' : ''
                  }`} />
                  <span className="hidden xs:inline">{tab.label}</span>
                  {hasContent && (
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      tab.id === 'stderr' ? 'bg-red-400' : 'bg-green-400'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Loading indicator */}
          {isExecuting && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-violet-500/20 rounded-md border border-violet-500/30">
              <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
              <span className="text-xs text-violet-400">Running</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            title="Copy output"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={activeTab === 'console' ? onClearConsole : onClear}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            title="Clear output"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={cycleHeight}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            {sheetHeight === 'expanded' ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-auto p-4"
        style={{ height: `calc(100% - 80px)` }}
      >
        <AnimatePresence mode="wait">
          {isExecuting && !output ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 border-3 border-violet-500/30 border-t-violet-500 rounded-full"
              />
              <span className="text-sm text-gray-400">Executing code...</span>
            </motion.div>
          ) : activeTab === 'stdout' ? (
            <motion.div
              key="stdout"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="font-mono text-sm"
            >
              {output?.stdout ? (
                <pre className="text-green-400 whitespace-pre-wrap break-words">
                  {output.stdout}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <Terminal className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">No output yet</span>
                  <span className="text-xs mt-1">Run your code to see results</span>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'stderr' ? (
            <motion.div
              key="stderr"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="font-mono text-sm"
            >
              {output?.stderr ? (
                <pre className="text-red-400 whitespace-pre-wrap break-words">
                  {output.stderr}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">No errors</span>
                  <span className="text-xs mt-1">Your code ran without issues</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="console"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-2"
            >
              {consoleMessages.length > 0 ? (
                consoleMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm font-mono ${
                      msg.type === 'error' ? 'bg-red-500/10 text-red-400' :
                      msg.type === 'warn' ? 'bg-yellow-500/10 text-yellow-400' :
                      msg.type === 'info' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-gray-800/50 text-gray-300'
                    }`}
                  >
                    <span className="opacity-50 text-xs whitespace-nowrap">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="break-words">{msg.message}</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">Console empty</span>
                  <span className="text-xs mt-1">Console logs will appear here</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
