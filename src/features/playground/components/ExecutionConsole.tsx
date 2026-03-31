'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  AlertCircle,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Copy,
  CheckCircle2,
  Trash2,
  Cpu,
  Zap,
  X,
} from 'lucide-react';
import { CodeExecutionResponse } from '@/types/playground.types';

export type ConsoleTab = 'stdout' | 'stderr' | 'console';

interface ExecutionConsoleProps {
  output: CodeExecutionResponse | null;
  isExecuting: boolean;
  onClear: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  consoleMessages?: ConsoleMessage[];
  onClearConsole?: () => void;
}

export interface ConsoleMessage {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: Date;
}

export default function ExecutionConsole({
  output,
  isExecuting,
  onClear,
  isCollapsed,
  onToggleCollapse,
  consoleMessages = [],
  onClearConsole,
}: ExecutionConsoleProps) {
  const [activeTab, setActiveTab] = useState<ConsoleTab>('stdout');
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const hasStdout = output?.stdout && output.stdout.trim().length > 0;
  const hasStderr = (output?.stderr && output.stderr.trim().length > 0) || (output?.error && output.error.trim().length > 0);
  const hasConsole = consoleMessages.length > 0;

  // Auto-select appropriate tab when output arrives
  useEffect(() => {
    if (output) {
      if (hasStderr) {
        setActiveTab('stderr');
      } else if (hasStdout) {
        setActiveTab('stdout');
      }
    }
  }, [output, hasStderr, hasStdout]);

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (contentRef.current && !isCollapsed) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [output, consoleMessages, isCollapsed]);

  const handleCopy = async () => {
    let textToCopy = '';
    if (activeTab === 'stdout' && output?.stdout) {
      textToCopy = output.stdout;
    } else if (activeTab === 'stderr' && (output?.stderr || output?.error)) {
      textToCopy = output.stderr || output.error || '';
    } else if (activeTab === 'console') {
      textToCopy = consoleMessages.map(m => `[${m.type.toUpperCase()}] ${m.message}`).join('\n');
    }

    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    if (activeTab === 'console' && onClearConsole) {
      onClearConsole();
    } else {
      onClear();
    }
  };

  const getLineCount = (text: string | undefined | null) => {
    if (!text) return 0;
    return text.split('\n').filter(l => l.trim()).length;
  };

  const stdoutLines = getLineCount(output?.stdout);
  const stderrLines = getLineCount(output?.stderr) + getLineCount(output?.error);

  return (
    <motion.div
      initial={false}
      animate={{ height: isCollapsed ? 44 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex flex-col bg-[#0d1117] border-t border-gray-800/50 overflow-hidden relative"
    >
      {/* Subtle glow line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      {/* Header with tabs and collapse toggle */}
      <div className="flex items-center justify-between px-4 h-11 bg-gray-900/80 border-b border-gray-800/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-1">
          {/* STDOUT Tab */}
          <TabButton
            isActive={activeTab === 'stdout'}
            onClick={() => setActiveTab('stdout')}
            icon={<Terminal className="w-3.5 h-3.5" />}
            label="STDOUT"
            count={stdoutLines}
            countColor="green"
            activeGradient="from-violet-500 via-green-400 to-pink-500"
          />

          {/* STDERR Tab */}
          <TabButton
            isActive={activeTab === 'stderr'}
            onClick={() => setActiveTab('stderr')}
            icon={<AlertCircle className="w-3.5 h-3.5" />}
            label="STDERR"
            count={stderrLines}
            countColor="red"
            activeGradient="from-violet-500 via-red-400 to-pink-500"
          />

          {/* Console Tab */}
          <TabButton
            isActive={activeTab === 'console'}
            onClick={() => setActiveTab('console')}
            icon={<MessageSquare className="w-3.5 h-3.5" />}
            label="CONSOLE"
            count={consoleMessages.length}
            countColor="cyan"
            activeGradient="from-violet-500 via-cyan-400 to-pink-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Executing indicator */}
          <AnimatePresence>
            {isExecuting && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/30 rounded-lg"
              >
                <LoadingSpinner />
                <span className="text-xs font-medium text-violet-400">Running...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Copy button */}
          {!isCollapsed && (
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
          )}

          {/* Clear button */}
          {!isCollapsed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all border border-transparent hover:border-gray-700/50"
              title="Clear"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}

          {/* Collapse toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleCollapse}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all border border-transparent hover:border-gray-700/50"
            title={isCollapsed ? 'Expand console' : 'Collapse console'}
          >
            {isCollapsed ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Content area */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden"
          >
            <div ref={contentRef} className="h-full overflow-auto">
              {isExecuting ? (
                <ExecutingContent />
              ) : activeTab === 'stdout' ? (
                <OutputContent 
                  text={output?.stdout || ''} 
                  colorClass="text-green-400"
                  emptyMessage="No stdout output"
                />
              ) : activeTab === 'stderr' ? (
                <OutputContent 
                  text={output?.stderr || output?.error || ''} 
                  colorClass="text-red-400"
                  emptyMessage="No stderr output"
                />
              ) : (
                <ConsoleContent messages={consoleMessages} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
  countColor: 'green' | 'red' | 'cyan';
  activeGradient: string;
}

function TabButton({ isActive, onClick, icon, label, count, countColor, activeGradient }: TabButtonProps) {
  const countBgClass = {
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  }[countColor];

  const activeTextClass = {
    green: 'text-green-400',
    red: 'text-red-400',
    cyan: 'text-cyan-400',
  }[countColor];

  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-2 text-xs font-medium transition-all duration-200 rounded-t-lg ${
        isActive
          ? `${activeTextClass} bg-[#0d1117] border-t border-x border-gray-800/50`
          : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span>{label}</span>
        {count !== undefined && count > 0 && (
          <span className={`px-1.5 py-0.5 text-[10px] rounded ${countBgClass}`}>
            {count}
          </span>
        )}
      </div>
      {isActive && (
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${activeGradient}`}
          layoutId="consoleActiveTab"
        />
      )}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <div className="relative w-4 h-4">
      <motion.div
        className="absolute inset-0 border-2 border-violet-500/30 border-t-violet-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

function ExecutingContent() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-full gap-4">
      <div className="relative">
        <motion.div
          className="w-12 h-12 border-3 border-violet-500/20 border-t-violet-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 border-2 border-pink-500/20 border-b-pink-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 blur-xl bg-violet-500/20 rounded-full animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-violet-400" />
        </div>
      </div>
      <div className="text-center">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
          <p className="text-white font-medium">Executing code{dots}</p>
        </div>
        <p className="text-gray-500 text-xs mt-1">Compiling and running</p>
      </div>
    </div>
  );
}

interface OutputContentProps {
  text: string;
  colorClass: string;
  emptyMessage: string;
}

function OutputContent({ text, colorClass, emptyMessage }: OutputContentProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedLines([]);
      return;
    }

    const lines = text.split('\n');
    setDisplayedLines([]);
    setIsStreaming(true);

    const timeoutIds = lines.map((line, index) =>
      setTimeout(() => {
        setDisplayedLines(prev => [...prev, line]);
        if (index === lines.length - 1) {
          setIsStreaming(false);
        }
      }, index * 20)
    );

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [text]);

  if (!text) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        <Terminal className="w-5 h-5 mr-2 opacity-50" />
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="p-4">
      <pre className={`font-mono text-sm leading-relaxed ${colorClass}`}>
        {displayedLines.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="mb-0.5"
          >
            <span className="text-gray-600 select-none mr-3 text-xs">
              {String(index + 1).padStart(3, ' ')}
            </span>
            {line}
            {index === displayedLines.length - 1 && isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="ml-1"
              >
                |
              </motion.span>
            )}
          </motion.div>
        ))}
      </pre>
    </div>
  );
}

function ConsoleContent({ messages }: { messages: ConsoleMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        <MessageSquare className="w-5 h-5 mr-2 opacity-50" />
        No console messages
      </div>
    );
  }

  const getMessageStyle = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400 bg-red-500/5 border-l-red-500';
      case 'warn':
        return 'text-yellow-400 bg-yellow-500/5 border-l-yellow-500';
      case 'info':
        return 'text-cyan-400 bg-cyan-500/5 border-l-cyan-500';
      default:
        return 'text-gray-300 bg-gray-500/5 border-l-gray-500';
    }
  };

  return (
    <div className="p-2 space-y-1">
      {messages.map((msg, index) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className={`px-3 py-2 text-sm font-mono border-l-2 rounded-r ${getMessageStyle(msg.type)}`}
        >
          <span className="text-gray-500 text-xs mr-2">
            {msg.timestamp.toLocaleTimeString()}
          </span>
          {msg.message}
        </motion.div>
      ))}
    </div>
  );
}
