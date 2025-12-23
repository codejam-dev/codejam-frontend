'use client';

import { CodeExecutionResponse } from '@/types/playground.types';
import { Clock, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExecutionMetricsProps {
  output: CodeExecutionResponse;
}

export default function ExecutionMetrics({ output }: ExecutionMetricsProps) {
  const isSuccess = output.exitCode === 0 && !output.error;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 px-3 py-1.5 bg-gray-800/40 rounded-lg border border-gray-700/30"
    >
      {/* Status Icon */}
      {isSuccess ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
      )}

      {/* Execution Time */}
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-xs font-semibold text-violet-400">{output.executionTime}ms</span>
      </div>

      {/* Memory (if available) */}
      {output.memory && (
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-xs font-semibold text-pink-400">{output.memory.toFixed(2)}MB</span>
        </div>
      )}
    </motion.div>
  );
}

