import "server-only";
import { db } from "@/lib/db";

/**
 * Telegram notifications for the doctor. The bot token lives only in the
 * TELEGRAM_BOT_TOKEN environment variable; the chat to notify is connected
 * from Admin → Settings and stored in Setting.telegramChatId.
 */

const TIMEOUT_MS = 8000;

export function telegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

type TgResponse<T> = { ok: boolean; result?: T; description?: string };

async function call<T>(method: string, body?: Record<string, unknown>): Promise<TgResponse<T>> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, description: "TELEGRAM_BOT_TOKEN is not set" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {}),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    return (await res.json()) as TgResponse<T>;
  } catch (e) {
    return { ok: false, description: e instanceof Error ? e.message : "request failed" };
  }
}

/** Escapes text for Telegram's HTML parse mode. */
export function esc(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function getBotUsername(): Promise<string | null> {
  const r = await call<{ username?: string }>("getMe");
  return r.ok ? (r.result?.username ?? null) : null;
}

type Chat = { id: number; type: string; title?: string; first_name?: string; last_name?: string; username?: string };
type Update = { update_id: number; message?: { chat: Chat }; my_chat_member?: { chat: Chat } };

/** Finds the most recent chat that wrote to the bot (e.g. "/start") and saves it as the recipient. */
export async function connectLatestChat(): Promise<{ ok: true; name: string } | { ok: false; reason: "no-token" | "no-messages" | "error" }> {
  if (!telegramConfigured()) return { ok: false, reason: "no-token" };
  const r = await call<Update[]>("getUpdates", { limit: 100, allowed_updates: ["message", "my_chat_member"] });
  if (!r.ok) return { ok: false, reason: "error" };
  const chats = (r.result ?? []).map((u) => u.message?.chat ?? u.my_chat_member?.chat).filter((c): c is Chat => Boolean(c));
  const chat = chats.at(-1);
  if (!chat) return { ok: false, reason: "no-messages" };
  const name = chat.title ?? ([chat.first_name, chat.last_name].filter(Boolean).join(" ") || (chat.username ? `@${chat.username}` : String(chat.id)));
  await db.setting.update({ where: { id: 1 }, data: { telegramChatId: String(chat.id), telegramChatName: name } });
  return { ok: true, name };
}

/** Sends an HTML message to the connected chat. Never throws; returns false if not sent. */
export async function notifyTelegram(html: string): Promise<boolean> {
  if (!telegramConfigured()) return false;
  const setting = await db.setting.findUnique({ where: { id: 1 }, select: { telegramChatId: true } });
  if (!setting?.telegramChatId) return false;
  const r = await call("sendMessage", { chat_id: setting.telegramChatId, text: html, parse_mode: "HTML", disable_web_page_preview: true });
  if (!r.ok) console.error("Telegram notification failed:", r.description);
  return r.ok;
}
