'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { RunHistoryItem, HistoryDisplayLanguage } from '@/types/playground.types';
import { languageConfigForHistory } from '@/lib/language-templates';
import { runHistoryLanguage } from '@/components/RunHistoryPanel';

function deriveStats(runs: RunHistoryItem[]) {
  const totalRuns = runs.length;
  if (totalRuns === 0) {
    return {
      totalRuns: 0,
      mostUsedKey: null as HistoryDisplayLanguage | null,
      successRate: null as number | null,
    };
  }

  const counts: Partial<Record<HistoryDisplayLanguage, number>> = {};
  let successes = 0;
  for (const run of runs) {
    const key = runHistoryLanguage(run.language);
    counts[key] = (counts[key] ?? 0) + 1;
    if (run.status === 'SUCCESS') successes += 1;
  }

  let mostUsedKey: HistoryDisplayLanguage | null = null;
  let max = 0;
  for (const [lang, n] of Object.entries(counts)) {
    if (n > max) {
      max = n;
      mostUsedKey = lang as HistoryDisplayLanguage;
    }
  }

  return {
    totalRuns,
    mostUsedKey,
    successRate: Math.round((successes / totalRuns) * 100),
  };
}

function successRateColor(rate: number): string {
  if (rate > 80) return 'text-emerald-400';
  if (rate >= 50) return 'text-amber-400';
  return 'text-red-400';
}

function StatSkeleton() {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className="h-3 w-16 animate-pulse rounded bg-zinc-800" />
      <div className="h-8 w-12 animate-pulse rounded-md bg-zinc-800/90" />
    </div>
  );
}

export interface QuickStatsProps {
  runs: RunHistoryItem[];
  loading: boolean;
}

export function QuickStats({ runs, loading }: QuickStatsProps) {
  const { totalRuns, mostUsedKey, successRate } = useMemo(
    () => deriveStats(runs),
    [runs]
  );

  const mostCfg = mostUsedKey ? languageConfigForHistory(mostUsedKey) : null;
  const MostIcon = mostCfg?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-6 backdrop-blur-sm"
    >
      <div className="mb-5 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-fuchsia-400" aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Quick Stats
        </h2>
      </div>

      {loading ? (
        <div className="flex gap-4 divide-x divide-zinc-800/80">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 divide-x divide-zinc-800/80 sm:gap-4">
          <div className="flex flex-col items-center px-2 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Total Runs
            </span>
            <span className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-100">
              {totalRuns}
            </span>
          </div>
          <div className="flex flex-col items-center px-2 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Most Used Language
            </span>
            {mostCfg && MostIcon ? (
              <div className="mt-1 flex flex-col items-center gap-1">
                <MostIcon
                  className="h-6 w-6"
                  style={{ color: mostCfg.iconColor }}
                  aria-hidden
                />
                <span className="text-xs font-medium text-zinc-300">
                  {mostCfg.name}
                </span>
              </div>
            ) : (
              <span className="mt-2 font-mono text-xl text-zinc-600">—</span>
            )}
          </div>
          <div className="flex flex-col items-center px-2 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Success Rate
            </span>
            {successRate === null ? (
              <span className="mt-2 font-mono text-xl text-zinc-600">—</span>
            ) : (
              <span
                className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${successRateColor(successRate)}`}
              >
                {successRate}%
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
