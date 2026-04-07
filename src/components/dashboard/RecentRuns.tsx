'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { RunHistoryItem, RunStatus } from '@/types/playground.types';
import { LANGUAGE_TEMPLATES } from '@/lib/language-templates';
import { runHistoryLanguage } from '@/components/RunHistoryPanel';

function formatTimeAgo(iso: string): string {
  try {
    const date = new Date(iso);
    const now = Date.now();
    const diffSec = Math.round((now - date.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const abs = Math.abs(diffSec);
    if (abs < 60) return rtf.format(-diffSec, 'second');
    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, 'minute');
    const diffHr = Math.round(diffMin / 60);
    if (Math.abs(diffHr) < 24) return rtf.format(-diffHr, 'hour');
    const diffDay = Math.round(diffHr / 24);
    if (Math.abs(diffDay) < 30) return rtf.format(-diffDay, 'day');
    const diffMonth = Math.round(diffDay / 30);
    if (Math.abs(diffMonth) < 12) return rtf.format(-diffMonth, 'month');
    return rtf.format(-Math.round(diffDay / 365), 'year');
  } catch {
    return '';
  }
}

function statusBadgeClasses(status: RunStatus): string {
  switch (status) {
    case 'SUCCESS':
      return 'bg-emerald-500/20 text-emerald-400';
    case 'ERROR':
      return 'bg-red-500/20 text-red-400';
    case 'TIMEOUT':
      return 'bg-amber-500/20 text-amber-400';
    case 'SYSTEM_ERROR':
    default:
      return 'bg-zinc-600/40 text-zinc-400';
  }
}

function statusLabel(status: RunStatus): string {
  switch (status) {
    case 'SUCCESS':
      return 'Success';
    case 'ERROR':
      return 'Error';
    case 'TIMEOUT':
      return 'Timeout';
    case 'SYSTEM_ERROR':
      return 'System';
    default:
      return status;
  }
}

function SkeletonBars() {
  return (
    <div className="space-y-3 pt-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-14 animate-pulse rounded-lg bg-zinc-800/80"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

export interface RecentRunsProps {
  runs: RunHistoryItem[];
  loading: boolean;
}

export function RecentRuns({ runs, loading }: RecentRunsProps) {
  const router = useRouter();
  const recent = runs.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-6 backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-violet-400" aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Recent Runs
        </h2>
      </div>

      {loading ? (
        <SkeletonBars />
      ) : recent.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No runs yet.{' '}
          <Link
            href="/playground"
            className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text font-medium text-transparent underline decoration-violet-500/50 underline-offset-2 hover:decoration-violet-400"
          >
            Try the playground!
          </Link>
        </p>
      ) : (
        <ul className="space-y-2">
          {recent.map((run, index) => {
            const langKey = runHistoryLanguage(run.language);
            const cfg = LANGUAGE_TEMPLATES[langKey];
            const Icon = cfg.icon;
            const preview =
              run.code?.replace(/\s+/g, ' ').trim().slice(0, 60) ||
              '(no code)';
            const truncated = preview.length >= 60 ? `${preview}…` : preview;

            return (
              <motion.li
                key={run.id}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.25 }}
              >
                <button
                  type="button"
                  onClick={() => router.push('/playground')}
                  className="flex w-full items-start gap-3 rounded-lg border border-transparent p-2 text-left transition hover:border-zinc-700/80 hover:bg-zinc-800/40"
                >
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-800/80"
                    style={{ color: cfg.iconColor }}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-zinc-500">
                        {formatTimeAgo(run.createdAt)}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadgeClasses(run.status)}`}
                      >
                        {statusLabel(run.status)}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-zinc-400 line-clamp-2">
                      {truncated}
                    </p>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}
