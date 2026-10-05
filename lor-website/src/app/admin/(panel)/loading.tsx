export default function Loading() {
  return (
    <div role="status" aria-label="…">
      <div className="h-9 w-56 animate-pulse rounded bg-line" />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-line/70" />)}
      </div>
      <div className="mt-6 h-64 animate-pulse rounded-xl bg-line/50" />
    </div>
  );
}
