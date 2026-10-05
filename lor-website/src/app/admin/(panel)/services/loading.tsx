/** Skeleton matching the services table layout to avoid layout shift. */
export default function Loading() {
  return (
    <div role="status" aria-label="Yuklanmoqda" className="animate-pulse">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="h-9 w-72 rounded bg-line" />
          <div className="mt-3 h-4 w-96 max-w-full rounded bg-line/70" />
        </div>
        <div className="h-11 w-36 rounded-lg bg-line" />
      </div>
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 5 }, (_, i) => <div key={i} className="h-9 w-28 rounded-full bg-line/80" />)}
      </div>
      <div className="mb-4 h-16 rounded-xl bg-line/60" />
      <div className="card divide-y divide-line">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="size-10 rounded-lg bg-line" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-line" />
              <div className="h-3 w-1/2 rounded bg-line/70" />
            </div>
            <div className="hidden h-5 w-24 rounded-full bg-line/80 md:block" />
            <div className="hidden h-4 w-20 rounded bg-line/70 md:block" />
            <div className="h-6 w-11 rounded-full bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
