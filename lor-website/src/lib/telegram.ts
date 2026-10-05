import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

/**
 * Telegram notifications for the doctor.
 *
 * The bot token lives only in TELEGRAM_BOT_TOKEN. Telegram delivers bot
 * messages to /api/telegram/webhook. A chat that presses /start is asked for
 * the access code (Admin → Settings); after the correct code it receives a
 * message for every new booking and contact-form message.
 */

const TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 30;

export function telegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

type TgResponse<T> = { ok: boolean; result?: T; description?: string; error_code?: number };

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

/* ---------- Webhook ---------- */

/** Secret Telegram echoes in X-Telegram-Bot-Api-Secret-Token, derived from the bot token. */
export function webhookSecret() {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
  return createHash("sha256").update(`lor-webhook:${token}`).digest("hex").slice(0, 48);
}

export function webhookSecretOk(given: string | null) {
  if (!telegramConfigured() || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(webhookSecret());
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Points the bot at this site's webhook (only on the production URL from SITE_URL). */
export async function ensureWebhook(): Promise<boolean> {
  const site = process.env.SITE_URL;
  if (!telegramConfigured() || !site || !site.startsWith("https://")) return false;
  const url = `${site.replace(/\/$/, "")}/api/telegram/webhook`;
  const info = await call<{ url?: string }>("getWebhookInfo");
  if (info.ok && info.result?.url === url) return true;
  const r = await call("setWebhook", { url, secret_token: webhookSecret(), allowed_updates: ["message"], drop_pending_updates: true });
  if (!r.ok) console.error("Telegram setWebhook failed:", r.description);
  return r.ok;
}

/* ---------- Access code ---------- */

export function newAccessCode() {
  return String(randomInt(100000, 1000000));
}

/** The current access code, created on first use. */
export async function getAccessCode() {
  const s = await db.setting.findUnique({ where: { id: 1 }, select: { telegramCode: true } });
  if (s?.telegramCode) return s.telegramCode;
  const code = newAccessCode();
  await db.setting.update({ where: { id: 1 }, data: { telegramCode: code } });
  return code;
}

/* ---------- Incoming bot messages ---------- */

type Chat = { id: number; type: string; title?: string; first_name?: string; last_name?: string; username?: string };
export type TgUpdate = { update_id: number; message?: { chat: Chat; text?: string } };

const chatName = (c: Chat) =>
  c.title ?? ([c.first_name, c.last_name].filter(Boolean).join(" ") || (c.username ? `@${c.username}` : String(c.id)));

const reply = (chatId: number, text: string) => call("sendMessage", { chat_id: chatId, text, parse_mode: "HTML" });

const MSG = {
  askCode: "🔐 Kirish kodini yuboring.\n<i>Отправьте код доступа.</i>",
  connected:
    "✅ Ulandingiz! Endi yangi qabullar va saytdan kelgan xabarlar shu yerga keladi.\n<i>Готово! Новые записи и сообщения с сайта будут приходить сюда.</i>\n\n/stop — o'chirish / отключить",
  already: "✅ Bu chat allaqachon ulangan.\n<i>Этот чат уже подключён.</i>\n\n/stop — o'chirish / отключить",
  wrong: (left: number) => `❌ Kod noto'g'ri. Yana ${left} ta urinish qoldi.\n<i>Неверный код. Осталось попыток: ${left}.</i>`,
  locked: `⛔ Juda ko'p noto'g'ri urinish. ${LOCK_MINUTES} daqiqadan keyin qayta urinib ko'ring.\n<i>Слишком много неверных попыток. Попробуйте через ${LOCK_MINUTES} минут.</i>`,
  stopped: "🔕 Bildirishnomalar o'chirildi. Qayta ulash uchun /start.\n<i>Уведомления отключены. Чтобы подключить снова — /start.</i>",
};

export async function handleUpdate(update: TgUpdate) {
  const msg = update.message;
  const text = msg?.text?.trim();
  if (!msg || !text) return;
  const chat = msg.chat;
  const chatId = String(chat.id);
  const record = await db.telegramChat.findUnique({ where: { chatId } });

  if (/^\/stop\b/.test(text)) {
    if (record) await db.telegramChat.delete({ where: { chatId } });
    await reply(chat.id, MSG.stopped);
    return;
  }
  if (record?.verified) {
    await reply(chat.id, MSG.already);
    return;
  }
  if (/^\/start\b/.test(text) || !record) {
    await db.telegramChat.upsert({ where: { chatId }, create: { chatId, name: chatName(chat) }, update: { name: chatName(chat) } });
    await reply(chat.id, MSG.askCode);
    return;
  }

  // An unverified chat sent something: treat it as the code.
  if (record.lockedUntil && record.lockedUntil > new Date()) {
    await reply(chat.id, MSG.locked);
    return;
  }
  const code = await getAccessCode();
  const given = text.replace(/\s+/g, "");
  const ok = given.length === code.length && timingSafeEqual(Buffer.from(given), Buffer.from(code));
  if (ok) {
    await db.telegramChat.update({ where: { chatId }, data: { verified: true, failedAttempts: 0, lockedUntil: null, name: chatName(chat) } });
    await reply(chat.id, MSG.connected);
    return;
  }
  const attempts = record.failedAttempts + 1;
  if (attempts >= MAX_ATTEMPTS) {
    await db.telegramChat.update({ where: { chatId }, data: { failedAttempts: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) } });
    await reply(chat.id, MSG.locked);
  } else {
    await db.telegramChat.update({ where: { chatId }, data: { failedAttempts: attempts } });
    await reply(chat.id, MSG.wrong(MAX_ATTEMPTS - attempts));
  }
}

/* ---------- Outgoing notifications ---------- */

/** Sends an HTML message to every connected chat. Never throws; returns how many received it. */
export async function notifyTelegram(html: string): Promise<number> {
  if (!telegramConfigured()) return 0;
  const chats = await db.telegramChat.findMany({ where: { verified: true }, select: { chatId: true } });
  let sent = 0;
  await Promise.all(
    chats.map(async ({ chatId }) => {
      const r = await call("sendMessage", { chat_id: chatId, text: html, parse_mode: "HTML", disable_web_page_preview: true });
      if (r.ok) sent++;
      // The person blocked the bot or left the group: stop sending there.
      else if (r.error_code === 403) await db.telegramChat.delete({ where: { chatId } }).catch(() => {});
      else console.error("Telegram notification failed:", r.description);
    }),
  );
  return sent;
}
