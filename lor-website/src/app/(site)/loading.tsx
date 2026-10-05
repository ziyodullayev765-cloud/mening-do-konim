export default function Loading() {
  return (
    <div className="container-x py-24" role="status" aria-label="Yuklanmoqda">
      <div className="h-4 w-40 animate-pulse rounded bg-line" />
      <div className="mt-6 h-14 w-full max-w-xl animate-pulse rounded bg-line" />
      <div className="mt-4 h-5 w-full max-w-md animate-pulse rounded bg-line" />
    </div>
  );
}
