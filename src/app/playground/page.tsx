'use client';

import CodePlayground from '@/components/CodePlayground';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function PlaygroundPage() {
  return (
    <ProtectedRoute>
      <div className="relative flex h-[calc(100vh-40px)] flex-col overflow-hidden bg-[#0a0a0f] text-white">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.1),transparent)]" />
        <CodePlayground />
      </div>
    </ProtectedRoute>
  );
}
