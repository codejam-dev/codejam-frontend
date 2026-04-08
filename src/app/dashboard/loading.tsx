export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-zinc-800" />
            <div className="flex flex-col gap-2">
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-800" />
              <div className="h-7 w-48 animate-pulse rounded bg-zinc-800" />
            </div>
          </div>
          <div className="h-11 w-40 animate-pulse rounded-xl bg-zinc-800" />
        </div>

        {/* Content grid skeleton */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-6">
            {/* Recent Runs card */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-5 w-5 animate-pulse rounded bg-zinc-800" />
                <div className="h-4 w-28 animate-pulse rounded bg-zinc-800" />
              </div>
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-zinc-800/30 p-3">
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-zinc-800" />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <div className="h-3 w-32 animate-pulse rounded bg-zinc-800" />
                      <div className="h-2.5 w-48 animate-pulse rounded bg-zinc-800" />
                    </div>
                    <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-800" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats card */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-6">
              <div className="mb-4 h-4 w-24 animate-pulse rounded bg-zinc-800" />
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 rounded-lg bg-zinc-800/30 p-4">
                    <div className="h-7 w-12 animate-pulse rounded bg-zinc-800" />
                    <div className="h-3 w-16 animate-pulse rounded bg-zinc-800" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Account card */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-6">
              <div className="mb-4 h-4 w-20 animate-pulse rounded bg-zinc-800" />
              <div className="flex flex-col gap-3">
                <div className="h-4 w-36 animate-pulse rounded bg-zinc-800" />
                <div className="h-3 w-48 animate-pulse rounded bg-zinc-800" />
                <div className="mt-2 h-9 w-32 animate-pulse rounded-lg bg-zinc-800" />
              </div>
            </div>

            {/* Collaboration card */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-6 opacity-60">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-4 w-28 animate-pulse rounded bg-zinc-800" />
                <div className="h-5 w-24 animate-pulse rounded-full bg-zinc-800" />
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-3 w-full animate-pulse rounded bg-zinc-800" />
                <div className="flex gap-3">
                  <div className="h-9 flex-1 animate-pulse rounded-lg bg-zinc-800" />
                  <div className="h-9 flex-1 animate-pulse rounded-lg bg-zinc-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
