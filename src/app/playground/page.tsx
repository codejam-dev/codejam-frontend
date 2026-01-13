'use client';

import CodePlayground from '@/components/CodePlayground';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import NavBar from '@/components/NavBar';

export default function PlaygroundPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen">
        <NavBar />
        <div className="flex-1 overflow-hidden">
          <CodePlayground />
        </div>
      </div>
    </ProtectedRoute>
  );
}
