"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { requireAdmin } from "@/lib/auth";
import { failure, success, type ActionState } from "@/lib/action";
import { PRICE_MAX, kindForCategory, serviceFormSchema } from "@/lib/schemas/service";
import { fieldErrors, id as idSchema } from "@/lib/validation";

const ui = t.admin.servicesUi;

/** Public pages, booking and admin all read services — refresh them together. */
function refreshAll() {
  revalidatePath("/", "layout");
}

function isPrismaError(e: unknown, code: string) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === code;
}

export type SaveServiceResult = ActionState & { id?: string };

/**
 * Create (no id) or update a service. Accepts the raw form values and parses
 * them with the SAME schema the client form uses.
 */
export async function saveService(id: string | null, values: unknown): Promise<SaveServiceResult> {
  await requireAdmin();

  const parsed = serviceFormSchema.safeParse(values);
  if (!parsed.success) return failure(t.common.invalidForm, fieldErrors(parsed.error));
  if (id !== null && !idSchema.safeParse(id).success) return failure(ui.notFound);

  const { sortOrder, imageUrl, ...rest } = parsed.data;
  const data = {
    ...rest,
    kind: kindForCategory(rest.category),
    imageUrl: imageUrl || null,
    sortOrder: sortOrder ?? 0,
  };

  try {
    const duplicate = await db.service.findFirst({
      where: { name: { equals: data.name, mode: "insensitive" }, ...(id ? { id: { not: id } } : {}) },
      select: { id: true },
    });
    if (duplicate) return failure(ui.duplicate, { name: [ui.duplicate] });

    const saved = id
      ? await db.service.update({ where: { id }, data, select: { id: true } })
      : await db.service.create({ data, select: { id: true } });

    refreshAll();
    return { ...success(id ? ui.updated : ui.created), id: saved.id };
  } catch (e) {
    if (isPrismaError(e, "P2025")) return failure(ui.notFound);
    console.error("saveService failed", e);
    return failure(t.common.serverError);
  }
}

/** Sets (not flips) the active flag, so retries and optimistic updates stay idempotent. */
export async function setServiceActive(id: string, active: boolean): Promise<ActionState> {
  await requireAdmin();
  const parsed = z.object({ id: idSchema, active: z.boolean() }).safeParse({ id, active });
  if (!parsed.success) return failure(t.common.invalidForm);
  try {
    const s = await db.service.update({ where: { id }, data: { active }, select: { name: true } });
    refreshAll();
    return success((active ? ui.activated : ui.deactivated).replace("{name}", s.name));
  } catch (e) {
    if (isPrismaError(e, "P2025")) return failure(ui.notFound);
    console.error("setServiceActive failed", e);
    return failure(t.common.serverError);
  }
}

export async function deleteService(id: string): Promise<ActionState> {
  await requireAdmin();
  if (!idSchema.safeParse(id).success) return failure(t.common.invalidForm);
  try {
    // Appointments keep their serviceName snapshot; serviceId becomes null (onDelete: SetNull).
    const s = await db.service.delete({ where: { id }, select: { name: true } });
    refreshAll();
    return success(ui.deleted.replace("{name}", s.name));
  } catch (e) {
    if (isPrismaError(e, "P2025")) return failure(ui.notFound);
    console.error("deleteService failed", e);
    return failure(t.common.serverError);
  }
}

/** Bulk price editor (/admin/prices). Uses the same positive-price rule as the service form. */
export async function savePrices(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const ids = formData.getAll("id").map(String);
  const priceSchema = z.preprocess(
    (v) => (v === "" || v == null ? null : Number(String(v).replace(/[\s,]/g, ""))),
    z.number().int().min(1).max(PRICE_MAX).nullable(),
  );
  const updates: { id: string; price: number | null; priceFrom: boolean }[] = [];
  const errors: Record<string, string[]> = {};
  for (const sid of ids) {
    if (!idSchema.safeParse(sid).success) continue;
    const parsed = priceSchema.safeParse(formData.get(`price_${sid}`));
    if (!parsed.success) {
      errors[`price_${sid}`] = ["Narx musbat butun son bo'lishi kerak."];
      continue;
    }
    // "from X" makes no sense without a price.
    updates.push({ id: sid, price: parsed.data, priceFrom: parsed.data !== null && formData.get(`from_${sid}`) === "on" });
  }
  if (Object.keys(errors).length) return failure(t.common.invalidForm, errors);
  try {
    await db.$transaction(updates.map((u) => db.service.updateMany({ where: { id: u.id }, data: { price: u.price, priceFrom: u.priceFrom } })));
  } catch (e) {
    console.error("savePrices failed", e);
    return failure(t.common.serverError);
  }
  refreshAll();
  return success(t.admin.prices.saved);
}
