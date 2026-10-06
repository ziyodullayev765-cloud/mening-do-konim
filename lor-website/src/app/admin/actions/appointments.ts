"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getL, getT } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { failure, success, type ActionState } from "@/lib/action";
import { isSlotFreeForAdmin } from "@/lib/slots";
import { DATE_RE, TIME_RE } from "@/lib/slots-shared";
import { id, statusSchema } from "@/lib/validation";
import { z } from "zod";

function refresh(appointmentId: string) {
  revalidatePath("/admin", "layout");
  revalidatePath(`/admin/appointments/${appointmentId}`);
}

export async function setAppointmentStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = z.object({ id, status: statusSchema }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure(t.common.invalidForm);
  const { id: appointmentId, status } = parsed.data;
  try {
    await db.appointment.update({ where: { id: appointmentId }, data: { status } });
  } catch (e) {
    // Re-activating a cancelled appointment whose slot is now taken.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return failure(t.admin.appointments.slotTaken);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return failure(t.admin.appointments.notFound);
    throw e;
  }
  refresh(appointmentId);
  return success(t.admin.appointments.statusUpdated);
}

export async function rescheduleAppointment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = z
    .object({
      id,
      date: z.string().regex(DATE_RE, t.booking.errors.date),
      time: z.string().regex(TIME_RE, t.booking.errors.time),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const i of parsed.error.issues) (errors[String(i.path[0])] ??= []).push(i.message);
    return failure(t.common.invalidForm, errors);
  }
  const { id: appointmentId, date, time } = parsed.data;
  if (!(await isSlotFreeForAdmin(date, time, appointmentId))) {
    return failure(t.admin.appointments.slotTaken, { time: [t.admin.appointments.slotTaken] });
  }
  try {
    await db.appointment.update({ where: { id: appointmentId }, data: { date, time, status: "RESCHEDULED" } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return failure(t.admin.appointments.slotTaken);
    throw e;
  }
  refresh(appointmentId);
  return success(t.admin.appointments.rescheduled);
}

export async function saveAppointmentNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = z.object({ id, adminNote: z.string().trim().max(2000) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure(t.common.invalidForm);
  await db.appointment.update({ where: { id: parsed.data.id }, data: { adminNote: parsed.data.adminNote } });
  refresh(parsed.data.id);
  return success(t.admin.appointments.noteSaved);
}

/**
 * Permanently deletes one or more appointments (ids from the `id` field, repeated
 * for a bulk delete). A patient left with no appointments is removed too.
 */
export async function deleteAppointments(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const L = await getL();
  const parsed = z.array(id).min(1).max(500).safeParse(formData.getAll("id"));
  if (!parsed.success) return failure(L("Hech qanday qabul tanlanmagan.", "Не выбрано ни одной записи."));
  const ids = [...new Set(parsed.data)];
  const deleted = await db.$transaction(async (tx) => {
    const rows = await tx.appointment.findMany({ where: { id: { in: ids } }, select: { patientId: true } });
    const { count } = await tx.appointment.deleteMany({ where: { id: { in: ids } } });
    const patientIds = [...new Set(rows.map((r) => r.patientId))];
    if (patientIds.length) await tx.patient.deleteMany({ where: { id: { in: patientIds }, appointments: { none: {} } } });
    return count;
  });
  revalidatePath("/admin", "layout");
  if (formData.get("back") === "1") redirect("/admin/appointments");
  return success(L(`O'chirildi: ${deleted} ta qabul.`, `Удалено записей: ${deleted}.`));
}
