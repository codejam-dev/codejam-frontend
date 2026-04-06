'use client';

/**
 * Layout exploration mock — visit /dev/playground-mobile-mock (mobile width or DevTools).
 * Not linked from production nav; delete or gate when no longer needed.
 */
import { useState } from 'react';
import { ChevronDown, ChevronUp, Terminal, AlertCircle, MessageSquare } from 'lucide-react';

export default function PlaygroundMobileLayoutMockPage() {
  const [inputOpen, setInputOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-200">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col border-x border-zinc-800/80 bg-[#0a0a0f] shadow-2xl">
        <header className="shrink-0 border-b border-zinc-800 bg-zinc-950/90 px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-violet-400/90">
            Dev mock — mobile playground stack
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            Tap <span className="text-zinc-300">INPUT</span> to toggle the stdin block. Order matches your sketch:
            INPUT → divider → tab header → (optional stdin) → stdout panel.
          </p>
        </header>

        {/* Fake editor */}
        <section className="min-h-[220px] shrink-0 border-b border-zinc-800 bg-[#1e1e1e] px-3 py-2">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
            <span className="font-mono text-violet-300/90">Main.js</span>
            <span>fake editor</span>
          </div>
          <pre className="font-mono text-[11px] leading-relaxed text-zinc-400">
            {`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`}
          </pre>
        </section>

        {/* INPUT row */}
        <button
          type="button"
          onClick={() => setInputOpen((o) => !o)}
          className="flex w-full shrink-0 items-center justify-between border-b border-zinc-700/60 bg-zinc-900/80 px-4 py-3 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800/80"
        >
          <span className="flex items-center gap-2 font-medium">
            <Terminal className="h-4 w-4 text-zinc-500" />
            INPUT
          </span>
          {inputOpen ? (
            <ChevronUp className="h-4 w-4 text-zinc-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          )}
        </button>

        {/* Expanded stdin */}
        {inputOpen && (
          <div className="shrink-0 border-b border-zinc-700/50 bg-zinc-900/50 px-4 py-3">
            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              Program stdin
            </label>
            <textarea
              readOnly
              placeholder="stdin for your program…"
              className="h-24 w-full resize-none rounded-lg border border-zinc-700/60 bg-zinc-950/80 px-3 py-2 font-mono text-xs text-zinc-300 placeholder-zinc-600"
              defaultValue=""
            />
          </div>
        )}

        {/* Divider (explicit in your sketch) */}
        <div className="h-px shrink-0 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" aria-hidden />

        {/* “Floating header” = stdout / stderr / console tabs (docked in flow for this mock) */}
        <div className="shrink-0 border-b border-zinc-700/50 bg-zinc-900/95 px-3 py-2">
          <p className="mb-2 text-[10px] uppercase tracking-wide text-zinc-500">Output header (tabs)</p>
          <div className="flex flex-wrap gap-1 rounded-lg bg-zinc-800/70 p-1">
            <span className="rounded-md bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white">
              <Terminal className="mr-1 inline h-3 w-3" />
              STDOUT
            </span>
            <span className="rounded-md px-3 py-1.5 text-xs text-zinc-400">
              <AlertCircle className="mr-1 inline h-3 w-3" />
              STDERR
            </span>
            <span className="rounded-md px-3 py-1.5 text-xs text-zinc-400">
              <MessageSquare className="mr-1 inline h-3 w-3" />
              CONSOLE
            </span>
          </div>
        </div>

        <div className="h-px shrink-0 bg-zinc-800" aria-hidden />

        {/* Stdout box */}
        <section className="flex min-h-[160px] flex-1 flex-col bg-[#0d1117] px-4 py-3">
          <p className="mb-2 text-[10px] uppercase tracking-wide text-zinc-500">Stdout box</p>
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700/50 bg-zinc-950/40 py-8 text-center">
            <Terminal className="mb-2 h-8 w-8 text-zinc-600" />
            <p className="text-sm text-zinc-500">No output yet</p>
            <p className="mt-1 text-xs text-zinc-600">Run your code to see results</p>
          </div>
        </section>

        {/* Fake status strip */}
        <footer className="shrink-0 border-t border-zinc-800 bg-zinc-950/95 px-4 py-1.5 text-[10px] text-zinc-500">
          Ln 1, Col 1 · 0 chars · Auto-saved
        </footer>
      </div>
    </div>
  );
}
