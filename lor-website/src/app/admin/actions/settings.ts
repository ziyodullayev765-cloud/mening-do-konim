"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getL, getT } from "@/lib/i18n/server";
import { connectLatestChat, notifyTelegram } from "@/lib/telegram";
import { requireAdmin } from "@/lib/auth";
import { failure, success, type ActionState } from "@/lib/action";
import { TIME_RE } from "@/lib/slots-shared";
import { toMinutes } from "@/lib/slots";
import { deleteUnusedMedia } from "@/lib/media";
import { adminSchemasFor, fieldErrors, id } from "@/lib/validation";

/* ---------- Weekly schedule ---------- */

export async function saveSchedule(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const days = [];
  const errors: Record<string, string[]> = {};
  for (let dow = 0; dow < 7; dow++) {
    const isOpen = formData.get(`open_${dow}`) === "on";
    const openTime = String(formData.get(`from_${dow}`) ?? "");
    const closeTime = String(formData.get(`to_${dow}`) ?? "");
    if (!TIME_RE.test(openTime) || !TIME_RE.test(closeTime)) {
      errors[`to_${dow}`] = [t.booking.errors.time];
      continue;
    }
    if (isOpen && toMinutes(closeTime) <= toMinutes(openTime)) {
      errors[`to_${dow}`] = [t.admin.schedule.invalidRange];
      continue;
    }
    days.push({ dayOfWeek: dow, isOpen, openTime, closeTime });
  }
  if (Object.keys(errors).length) return failure(t.common.invalidForm, errors);
  await db.$transaction(
    days.map((d) => db.workingDay.upsert({ where: { dayOfWeek: d.dayOfWeek }, create: d, update: d })),
  );
  revalidatePath("/", "layout");
  return success(t.admin.schedule.saved);
}

export async function addBlockedDate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = adminSchemasFor(t).blockedDateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure(t.common.invalidForm, fieldErrors(parsed.error));
  try {
    await db.blockedDate.create({ data: parsed.data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return failure(t.admin.schedule.blockedExists, { date: [t.admin.schedule.blockedExists] });
    }
    throw e;
  }
  revalidatePath("/", "layout");
  return success(t.admin.schedule.blockedAdded);
}

export async function removeBlockedDate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = id.safeParse(formData.get("id"));
  if (!parsed.success) return failure(t.common.invalidForm);
  await db.blockedDate.delete({ where: { id: parsed.data } });
  revalidatePath("/", "layout");
  return success(t.admin.schedule.blockedRemoved);
}

/* ---------- Site settings ---------- */

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = adminSchemasFor(t).settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure(t.common.invalidForm, fieldErrors(parsed.error));
  const data = { ...parsed.data, backgroundUrl: parsed.data.backgroundUrl || null };
  const before = await db.setting.findUnique({ where: { id: 1 }, select: { backgroundUrl: true } });
  await db.setting.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
  if (before?.backgroundUrl && before.backgroundUrl !== data.backgroundUrl) await deleteUnusedMedia([before.backgroundUrl]);
  revalidatePath("/", "layout");
  return success(t.admin.settings.saved);
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  const admin = await requireAdmin();
  const parsed = adminSchemasFor(t).passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure(t.common.invalidForm, fieldErrors(parsed.error));
  const record = await db.admin.findUniqueOrThrow({ where: { id: admin.id } });
  if (!(await bcrypt.compare(parsed.data.currentPassword, record.passwordHash))) {
    return failure(t.admin.settings.wrongPassword, { currentPassword: [t.admin.settings.wrongPassword] });
  }
  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.admin.update({ where: { id: admin.id }, data: { passwordHash } });
  return success(t.admin.settings.passwordChanged);
}

/* ---------- Telegram notifications ---------- */

export async function connectTelegram(): Promise<ActionState> {
  await requireAdmin();
  const L = await getL();
  const r = await connectLatestChat();
  if (r.ok) {
    await notifyTelegram(`✅ ${L("Bildirishnomalar ulandi. Yangi qabullar shu yerga keladi.", "Уведомления подключены. Новые записи будут приходить сюда.")}`);
    revalidatePath("/admin/settings");
    return success(L(`Telegram ulandi: ${r.name}`, `Telegram подключён: ${r.name}`));
  }
  if (r.reason === "no-messages") return failure(L("Botga hali xabar yozilmagan. Telegram'da botni ochib /start yozing va qayta urinib ko'ring.", "Боту ещё никто не писал. Откройте бота в Telegram, отправьте /start и попробуйте снова."));
  if (r.reason === "no-token") return failure(L("TELEGRAM_BOT_TOKEN sozlanmagan.", "TELEGRAM_BOT_TOKEN не настроен."));
  return failure(L("Telegram bilan bog'lanib bo'lmadi. Keyinroq urinib ko'ring.", "Не удалось связаться с Telegram. Попробуйте позже."));
}

export async function testTelegram(): Promise<ActionState> {
  await requireAdmin();
  const L = await getL();
  const ok = await notifyTelegram(`🔔 ${L("Sinov xabari: bildirishnomalar ishlayapti.", "Тестовое сообщение: уведомления работают.")}`);
  return ok ? success(L("Sinov xabari yuborildi.", "Тестовое сообщение отправлено.")) : failure(L("Xabar yuborilmadi. Avval Telegram'ni ulang.", "Сообщение не отправлено. Сначала подключите Telegram."));
}

export async function disconnectTelegram(): Promise<ActionState> {
  await requireAdmin();
  const L = await getL();
  await db.setting.update({ where: { id: 1 }, data: { telegramChatId: null, telegramChatName: null } });
  revalidatePath("/admin/settings");
  return success(L("Telegram uzildi.", "Telegram отключён."));
}
