'use client';

import CodePlayground from '@/components/CodePlayground';
import PlaygroundNavBar from '@/components/PlaygroundNavBar';
import { motion } from 'framer-motion';

export default function PlaygroundPage() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#0a0a0f] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.1),transparent)]" />

      <PlaygroundNavBar />

      <motion.div
        className="min-h-0 flex-1 overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <CodePlayground />
      </motion.div>
    </div>
  );
}
