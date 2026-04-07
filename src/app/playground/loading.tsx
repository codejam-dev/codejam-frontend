export default function PlaygroundLoading() {
  return (
    <div className="relative flex h-[calc(100vh-40px)] flex-col overflow-hidden bg-[#0a0a0f] text-white">
      {/* Toolbar skeleton */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-800/60 bg-zinc-950/90 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-28 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-6 w-px bg-zinc-800" />
          <div className="h-5 w-32 animate-pulse rounded bg-zinc-800" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-zinc-800" />
        </div>
      </div>

      {/* Editor + Output split skeleton */}
      <div className="flex min-h-0 flex-1">
        {/* Editor pane */}
        <div className="flex flex-1 flex-col border-r border-zinc-800/40">
          {/* Line numbers + code area */}
          <div className="flex flex-1 p-4">
            <div className="mr-4 flex flex-col gap-1.5 pt-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-3 w-4 animate-pulse rounded bg-zinc-800/50 text-right" />
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 pt-1">
              {[80, 60, 45, 70, 55, 30, 65, 50, 40, 75, 20, 60].map((w, i) => (
                <div
                  key={i}
                  className="h-3 animate-pulse rounded bg-zinc-800/40"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Output pane */}
        <div className="flex w-[42%] flex-col bg-[#0d1117]">
          {/* Output tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-800/60 px-3 py-2">
            <div className="h-5 w-14 animate-pulse rounded bg-zinc-800" />
            <div className="h-5 w-14 animate-pulse rounded bg-zinc-800" />
            <div className="h-5 w-16 animate-pulse rounded bg-zinc-800" />
          </div>
          {/* Output area */}
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-800/30" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-800/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
