import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Receives JavaScript errors from visitors' browsers and writes them to the
 * server log (visible in Vercel → Logs), so problems on real devices can be
 * diagnosed. Accepts only short text; nothing is stored.
 */
export async function POST(req: Request) {
  const ip = await clientIp();
  if (!rateLimit(`client-error:${ip}`, 20, 10 * 60 * 1000).ok) return new Response(null, { status: 204 });
  try {
    const raw = (await req.text()).slice(0, 4000);
    const data = JSON.parse(raw) as Record<string, unknown>;
    const str = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
    console.error("[client-error]", JSON.stringify({
      message: str(data.message, 500),
      source: str(data.source, 300),
      stack: str(data.stack, 1500),
      url: str(data.url, 300),
      ua: (req.headers.get("user-agent") ?? "").slice(0, 300),
    }));
  } catch {}
  return new Response(null, { status: 204 });
}
