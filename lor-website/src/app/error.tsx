"use client";

import { useEffect } from "react";
import { t } from "@/lib/i18n";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    // Errors caught by this boundary don't reach window.onerror — report them too.
    (window as unknown as { __reportError?: (m: string, s: string, st?: string) => void }).__reportError?.(error.message, `boundary${error.digest ? ` digest=${error.digest}` : ""}`, error.stack);
  }, [error]);
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-4xl">{t.error.title}</h1>
        <p className="mt-3 text-muted">{t.error.lead}</p>
        <button type="button" onClick={reset} className="btn btn-dark mt-8">{t.error.retry}</button>
      </div>
    </main>
  );
}
