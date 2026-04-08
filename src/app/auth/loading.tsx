export default function AuthLoading() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="relative w-full max-w-md px-4">
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md">
          {/* Brand placeholder */}
          <div className="mx-auto mb-6 h-6 w-24 animate-pulse rounded bg-zinc-800" />
          {/* Title placeholder */}
          <div className="mx-auto mb-2 h-7 w-44 animate-pulse rounded bg-zinc-800" />
          <div className="mx-auto mb-8 h-4 w-56 animate-pulse rounded bg-zinc-800" />

          {/* Google button placeholder */}
          <div className="mb-6 h-12 w-full animate-pulse rounded-lg bg-zinc-800" />

          {/* Divider */}
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <div className="h-3 w-32 animate-pulse rounded bg-zinc-800" />
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Input fields */}
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-1.5 h-3.5 w-20 animate-pulse rounded bg-zinc-800" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-800/80" />
            </div>
            <div>
              <div className="mb-1.5 h-3.5 w-16 animate-pulse rounded bg-zinc-800" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-800/80" />
            </div>
          </div>

          {/* Submit button */}
          <div className="mt-6 h-10 w-full animate-pulse rounded-lg bg-zinc-800" />

          {/* Bottom link */}
          <div className="mt-6 flex justify-center">
            <div className="h-3 w-40 animate-pulse rounded bg-zinc-800" />
          </div>
        </div>
        {/* Copyright */}
        <div className="mt-8 flex justify-center">
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
