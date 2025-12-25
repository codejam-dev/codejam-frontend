'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { authState, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">CodeJam</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="text-gray-400">Welcome,</p>
                <p className="text-white font-medium">{authState.user?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 p-8">
          <h2 className="text-3xl font-bold text-white mb-4">Dashboard</h2>
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-2">User Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-400">User ID:</dt>
                  <dd className="text-white font-mono text-sm">{authState.user?.userId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Name:</dt>
                  <dd className="text-white">{authState.user?.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Email:</dt>
                  <dd className="text-white">{authState.user?.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Status:</dt>
                  <dd className="text-white">
                    {authState.user?.isEnabled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                        Inactive
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Token Information</h3>
              <p className="text-sm text-gray-400 mb-2">Your authentication token:</p>
              <div className="bg-gray-900/50 rounded p-3 overflow-x-auto">
                <code className="text-xs text-green-400 break-all">
                  {authState.token?.substring(0, 100)}...
                </code>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
