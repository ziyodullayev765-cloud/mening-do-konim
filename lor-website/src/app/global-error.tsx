"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // The root layout (and its error reporter) is replaced here, so report directly.
    const body = JSON.stringify({ message: error.message, source: `global-boundary digest=${error.digest ?? ""}`, stack: error.stack ?? "", url: location.href });
    fetch("/api/client-error", { method: "POST", body, keepalive: true }).catch(() => {});
  }, [error]);
  return (
    <html lang="uz">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, background: "#f3fafa", color: "#0f2f3a" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontWeight: 500 }}>Nimadir noto&apos;g&apos;ri ketdi</h1>
          <button onClick={reset} style={{ marginTop: 16, padding: "10px 18px", borderRadius: 8, border: 0, background: "#0f2f3a", color: "#fff", cursor: "pointer" }}>
            Qayta yuklash
          </button>
        </div>
      </body>
    </html>
  );
}
