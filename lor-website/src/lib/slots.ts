import "server-only";
import { db } from "@/lib/db";

import { DATE_RE, TIME_RE } from "@/lib/slots-shared";
export { DATE_RE, TIME_RE };

export function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function dayOfWeek(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return next.toISOString().slice(0, 10);
}

export function isValidDate(date: string) {
  if (!DATE_RE.test(date)) return false;
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Current date (YYYY-MM-DD) and minutes since midnight in the clinic's time zone. */
export function clinicNow(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export async function getSettings() {
  return (
    (await db.setting.findUnique({ where: { id: 1 } })) ??
    (await db.setting.create({ data: { id: 1 } }))
  );
}

type Context = {
  settings: Awaited<ReturnType<typeof getSettings>>;
  days: Map<number, { isOpen: boolean; openTime: string; closeTime: string; breakStart: string; breakEnd: string }>;
  blocked: Set<string>;
  taken: Map<string, Set<string>>;
  now: { date: string; minutes: number };
};

async function loadContext(from: string, to: string, excludeAppointmentId?: string): Promise<Context> {
  const settings = await getSettings();
  const [workingDays, blocked, appointments] = await Promise.all([
    db.workingDay.findMany(),
    db.blockedDate.findMany({ where: { date: { gte: from, lte: to } } }),
    db.appointment.findMany({
      where: {
        date: { gte: from, lte: to },
        status: { not: "CANCELLED" },
        ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
      },
      select: { date: true, time: true },
    }),
  ]);
  const taken = new Map<string, Set<string>>();
  for (const a of appointments) {
    if (!taken.has(a.date)) taken.set(a.date, new Set());
    taken.get(a.date)!.add(a.time);
  }
  return {
    settings,
    days: new Map(workingDays.map((d) => [d.dayOfWeek, d])),
    blocked: new Set(blocked.map((b) => b.date)),
    taken,
    now: clinicNow(settings.timezone),
  };
}

function slotsFor(date: string, ctx: Context, { enforceNotice = true } = {}) {
  if (ctx.blocked.has(date)) return [];
  const day = ctx.days.get(dayOfWeek(date));
  if (!day || !day.isOpen) return [];
  const step = Math.max(5, ctx.settings.slotMinutes);
  const open = toMinutes(day.openTime);
  const close = toMinutes(day.closeTime);
  const hasBreak = TIME_RE.test(day.breakStart) && TIME_RE.test(day.breakEnd) && day.breakEnd > day.breakStart;
  const breakFrom = hasBreak ? toMinutes(day.breakStart) : 0;
  const breakTo = hasBreak ? toMinutes(day.breakEnd) : 0;
  const taken = ctx.taken.get(date) ?? new Set<string>();
  const earliest = date === ctx.now.date && enforceNotice ? ctx.now.minutes + ctx.settings.minNoticeMinutes : -1;
  const out: string[] = [];
  for (let m = open; m + step <= close; m += step) {
    if (m < earliest) continue;
    if (hasBreak && m < breakTo && m + step > breakFrom) continue; // overlaps the break
    const time = fromMinutes(m);
    if (!taken.has(time)) out.push(time);
  }
  return out;
}

/** Bookable window: [today, today + bookingWindowDays). */
function windowRange(ctx: Pick<Context, "now" | "settings">) {
  const from = ctx.now.date;
  const to = addDays(from, Math.max(1, ctx.settings.bookingWindowDays) - 1);
  return { from, to };
}

/** Dates in the booking window that still have at least one free slot. */
export async function getAvailableDates() {
  const settings = await getSettings();
  const now = clinicNow(settings.timezone);
  const { from, to } = windowRange({ now, settings });
  const ctx = await loadContext(from, to);
  const dates: { date: string; slots: number }[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const count = slotsFor(d, ctx).length;
    if (count > 0) dates.push({ date: d, slots: count });
  }
  return { from, to, dates };
}

/** Free slots for a single date (empty if the date is outside the window). */
export async function getAvailableSlots(date: string) {
  if (!isValidDate(date)) return [];
  const settings = await getSettings();
  const now = clinicNow(settings.timezone);
  const { from, to } = windowRange({ now, settings });
  if (date < from || date > to) return [];
  const ctx = await loadContext(date, date);
  return slotsFor(date, ctx);
}

/**
 * Admin rescheduling: any slot inside working hours that is not taken,
 * ignoring the booking window and notice period, and excluding the
 * appointment being moved.
 */
export async function isSlotFreeForAdmin(date: string, time: string, appointmentId: string) {
  if (!isValidDate(date) || !TIME_RE.test(time)) return false;
  const ctx = await loadContext(date, date, appointmentId);
  return !ctx.taken.get(date)?.has(time);
}

export async function getWeekSchedule() {
  const days = await db.workingDay.findMany({ orderBy: { dayOfWeek: "asc" } });
  // Monday-first ordering for display.
  return [1, 2, 3, 4, 5, 6, 0]
    .map((dow) => days.find((d) => d.dayOfWeek === dow))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
}
