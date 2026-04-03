'use client';

import { motion } from 'framer-motion';
import { Play, Loader2 } from 'lucide-react';

interface FloatingRunButtonProps {
  onClick: () => void;
  isExecuting: boolean;
}

export default function FloatingRunButton({
  onClick,
  isExecuting,
}: FloatingRunButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isExecuting}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: isExecuting ? 1 : 1.1 }}
      whileTap={{ scale: isExecuting ? 1 : 0.95 }}
      className="fixed bottom-[5.25rem] right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-pink-600 shadow-lg shadow-violet-500/30 transition-all disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none"
      style={{
        boxShadow: isExecuting 
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
        <Loader2 className="w-6 h-6 text-white animate-spin" />
      ) : (
        <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
      )}
    </motion.button>
  );
}
