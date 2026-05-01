'use client';

import { motion } from 'framer-motion';
import { Play, Loader2, Square } from 'lucide-react';

interface FloatingRunButtonProps {
  onRun: () => void;
  /** When set, tap while executing calls stop instead of being disabled. */
  onStop?: () => void;
  isExecuting: boolean;
}

export default function FloatingRunButton({
  onRun,
  onStop,
  isExecuting,
}: FloatingRunButtonProps) {
  const handleClick = () => {
    if (isExecuting && onStop) onStop();
    else if (!isExecuting) onRun();
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isExecuting && !onStop}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: !isExecuting || onStop ? 1.1 : 1 }}
      whileTap={{ scale: !isExecuting || onStop ? 0.95 : 1 }}
      className={`fixed bottom-[5.25rem] right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r shadow-lg transition-all disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none ${
        isExecuting && onStop
          ? 'from-rose-600 to-rose-700 shadow-rose-900/30'
          : 'from-violet-600 to-pink-600 shadow-violet-500/30'
      }`}
      style={{
        boxShadow:
          isExecuting && onStop
            ? '0 8px 24px rgba(225, 29, 72, 0.35)'
            : isExecuting
              ? 'none'
              : '0 8px 32px rgba(139, 92, 246, 0.4), 0 0 0 4px rgba(139, 92, 246, 0.1)',
      }}
    >
      {/* Animated ring when not executing */}
      {!isExecuting && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-violet-400/50"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Shimmer effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Icon */}
      {isExecuting ? (
        onStop ? (
          <Square className="w-5 h-5 text-white fill-current" />
        ) : (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        )
      ) : (
        <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
      )}
    </motion.button>
  );
}
