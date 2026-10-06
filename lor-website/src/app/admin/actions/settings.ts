"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getL, getT } from "@/lib/i18n/server";
import { newAccessCode, notifyTelegram } from "@/lib/telegram";
import { requireAdmin } from "@/lib/auth";
import { failure, success, type ActionState } from "@/lib/action";
import { TIME_RE } from "@/lib/slots-shared";
import { toMinutes } from "@/lib/slots";
import { deleteUnusedMedia } from "@/lib/media";
import { adminSchemasFor, fieldErrors, id } from "@/lib/validation";

/* ---------- Weekly schedule ---------- */

export async function saveSchedule(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  const L = await getL();
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
    const breakStart = String(formData.get(`bfrom_${dow}`) ?? "");
    const breakEnd = String(formData.get(`bto_${dow}`) ?? "");
    if (breakStart || breakEnd) {
      const valid = TIME_RE.test(breakStart) && TIME_RE.test(breakEnd) && breakEnd > breakStart;
      const inside = valid && breakStart >= openTime && breakEnd <= closeTime;
      if (isOpen && !inside) {
        errors[`to_${dow}`] = [L("Tanaffus ish vaqti ichida bo'lishi va tugashi boshlanishidan keyin bo'lishi kerak.", "Перерыв должен быть внутри рабочего времени и заканчиваться после начала.")];
        continue;
      }
      days.push({ dayOfWeek: dow, isOpen, openTime, closeTime, breakStart: valid ? breakStart : "", breakEnd: valid ? breakEnd : "" });
      continue;
    }
    days.push({ dayOfWeek: dow, isOpen, openTime, closeTime, breakStart: "", breakEnd: "" });
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
  const data = {
    ...parsed.data,
    backgroundUrl: parsed.data.backgroundUrl || null,
    loginBackgroundUrl: parsed.data.loginBackgroundUrl || null,
  };
  const before = await db.setting.findUnique({ where: { id: 1 }, select: { backgroundUrl: true, loginBackgroundUrl: true } });
  await db.setting.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
  const replaced = [before?.backgroundUrl, before?.loginBackgroundUrl].filter(
    (u): u is string => Boolean(u) && u !== data.backgroundUrl && u !== data.loginBackgroundUrl,
  );
  if (replaced.length) await deleteUnusedMedia(replaced);
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

export async function regenerateTelegramCode(): Promise<ActionState> {
  await requireAdmin();
  const L = await getL();
  await db.setting.update({ where: { id: 1 }, data: { telegramCode: newAccessCode() } });
  revalidatePath("/admin/settings");
  return success(L("Yangi kod yaratildi. Ulangan chatlar uzilmaydi.", "Создан новый код. Подключённые чаты остаются."));
}

export async function testTelegram(): Promise<ActionState> {
  await requireAdmin();
  const L = await getL();
  const sent = await notifyTelegram(`🔔 ${L("Sinov xabari: bildirishnomalar ishlayapti.", "Тестовое сообщение: уведомления работают.")}`);
  return sent > 0
    ? success(L(`Sinov xabari yuborildi (${sent} ta chat).`, `Тестовое сообщение отправлено (чатов: ${sent}).`))
    : failure(L("Xabar yuborilmadi: hali birorta chat ulanmagan.", "Сообщение не отправлено: пока нет подключённых чатов."));
}

export async function removeTelegramChat(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const L = await getL();
  const parsed = id.safeParse(formData.get("id"));
  if (!parsed.success) return failure(L("Chat topilmadi.", "Чат не найден."));
  await db.telegramChat.delete({ where: { id: parsed.data } }).catch(() => {});
  revalidatePath("/admin/settings");
  return success(L("Chat uzildi.", "Чат отключён."));
}
