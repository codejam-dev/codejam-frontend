'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export function CollaborationCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-6 opacity-60 backdrop-blur-sm"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-zinc-500" aria-hidden />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Collaboration
          </h2>
        </div>
        <span className="rounded-full border border-zinc-700/80 bg-zinc-800/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          Coming Soon
        </span>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-zinc-500">
        Real-time collaborative coding rooms are coming soon.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-lg border border-zinc-800/80 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-600"
        >
          Create a Room
        </button>
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-lg border border-zinc-800/80 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-600"
        >
          Join a Room
        </button>
      </div>
    </motion.div>
  );
}
