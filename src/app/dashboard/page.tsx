'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import NavBar from '@/components/NavBar';
import { PlaygroundService } from '@/services/playground.service';
import { RunHistoryItem } from '@/types/playground.types';
import { RecentRuns } from '@/components/dashboard/RecentRuns';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { AccountCard } from '@/components/dashboard/AccountCard';
import { CollaborationCard } from '@/components/dashboard/CollaborationCard';

function firstNameFromDisplayName(name: string | undefined): string {
  if (!name?.trim()) return 'there';
  const part = name.trim().split(/\s+/)[0] ?? 'there';
  return part || 'there';
}

function initialsFromName(name: string | undefined): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase() || '?';
}

function DashboardContent() {
  const router = useRouter();
  const { authState } = useAuth();
  const [runs, setRuns] = useState<RunHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = authState.token;
    if (!token) {
      setRuns([]);
      setHistoryLoading(false);
      return;
    }
    setHistoryLoading(true);
    PlaygroundService.getRunHistory(token)
      .then((items) => {
        if (!cancelled) setRuns(items);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authState.token]);

  const firstName = useMemo(
    () => firstNameFromDisplayName(authState.user?.name),
    [authState.user?.name]
  );
  const initials = useMemo(
    () => initialsFromName(authState.user?.name),
    [authState.user?.name]
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans text-zinc-100">
      <NavBar />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-lg font-semibold text-white shadow-lg shadow-violet-900/30"
              aria-hidden
            >
              {initials}
            </div>
            <div>
              <p className="text-sm text-zinc-500">Developer Hub</p>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                Welcome back, {firstName}
              </h1>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/playground')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Open Playground
          </motion.button>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-6">
            <RecentRuns runs={runs} loading={historyLoading} />
            <QuickStats runs={runs} loading={historyLoading} />
          </div>
          <div className="flex flex-col gap-6">
            <AccountCard user={authState.user} />
            <CollaborationCard />
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
