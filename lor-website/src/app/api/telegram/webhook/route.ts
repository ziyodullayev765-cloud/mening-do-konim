import { ensureWebhook, handleUpdate, webhookSecretOk, type TgUpdate } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/** Telegram bot webhook: /start → asks for the access code; correct code → chat gets booking alerts. */
export async function POST(req: Request) {
  if (!webhookSecretOk(req.headers.get("x-telegram-bot-api-secret-token"))) return new Response("Not found", { status: 404 });
  try {
    await handleUpdate((await req.json()) as TgUpdate);
  } catch (e) {
    console.error("Telegram webhook failed", e);
  }
  // Always 200 so Telegram doesn't retry the same update forever.
  return Response.json({ ok: true });
}

/** Idempotent: (re)points the bot at this site's webhook. Returns only whether it is connected. */
export async function GET() {
  return Response.json({ connected: await ensureWebhook() });
}
