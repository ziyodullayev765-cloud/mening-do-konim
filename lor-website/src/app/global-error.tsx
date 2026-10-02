"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="uz">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, background: "#f8f6f1", color: "#0e1a2b" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontWeight: 500 }}>Nimadir noto&apos;g&apos;ri ketdi</h1>
          <button onClick={reset} style={{ marginTop: 16, padding: "10px 18px", borderRadius: 8, border: 0, background: "#0e1a2b", color: "#fff", cursor: "pointer" }}>
            Qayta yuklash
          </button>
        </div>
      </body>
    </html>
  );
}
