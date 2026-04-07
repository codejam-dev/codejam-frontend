'use client';

import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export interface AccountCardUser {
  userId?: string;
  name?: string;
  email?: string;
  isEnabled?: boolean;
}

export interface AccountCardProps {
  user: AccountCardUser | null;
}

export function AccountCard({ user }: AccountCardProps) {
  const active = user?.isEnabled === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-6 backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <User className="h-4 w-4 text-violet-400" aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Account
        </h2>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Name
          </p>
          <p className="mt-0.5 text-sm font-medium text-zinc-100">
            {user?.name ?? '—'}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Email
          </p>
          <p className="mt-0.5 break-all text-sm text-zinc-300">
            {user?.email ?? '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Status
          </span>
          <span
            className={
              active
                ? 'inline-flex rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400'
                : 'inline-flex rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-400'
            }
          >
            {active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <button
          type="button"
          disabled
          title="Coming Soon"
          className="w-full cursor-not-allowed rounded-lg border border-zinc-700/50 bg-zinc-800/30 px-4 py-2.5 text-sm font-medium text-zinc-500 opacity-70"
        >
          Manage Account
        </button>
      </div>
    </motion.div>
  );
}
