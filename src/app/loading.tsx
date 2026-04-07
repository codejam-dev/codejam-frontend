export default function RootLoading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-zinc-700 border-t-violet-500" />
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    </div>
  );
}
