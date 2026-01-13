'use client';

import CodePlayground from '@/components/CodePlayground';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import NavBar from '@/components/NavBar';
import { motion } from 'framer-motion';

export default function PlaygroundPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-pink-900/20"
            animate={{
              background: [
                'radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 0% 100%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>

        {/* Navigation */}
        <NavBar />

        {/* Playground with entrance animation */}
        <motion.div
          className="flex-1 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <CodePlayground />
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
