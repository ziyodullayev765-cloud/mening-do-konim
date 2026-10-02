"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { requireAdmin } from "@/lib/auth";
import { failure, success, type ActionState } from "@/lib/action";
import { SERVICE_ICONS } from "@/lib/icons";
import { fieldErrors, id, serviceSchema } from "@/lib/validation";

function refreshAll() {
  revalidatePath("/", "layout");
}

function listPath(kind: "SERVICE" | "PROCEDURE") {
  return kind === "PROCEDURE" ? "/admin/procedures" : "/admin/services";
}

export async function saveService(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure(t.common.invalidForm, fieldErrors(parsed.error));
  const { sortOrder, icon, imageUrl, ...rest } = parsed.data;
  const data = {
    ...rest,
    icon: icon in SERVICE_ICONS ? icon : "stethoscope",
    imageUrl: imageUrl || null,
    sortOrder: sortOrder ?? 0,
  };
  const serviceId = formData.get("id");
  if (typeof serviceId === "string" && serviceId) {
    await db.service.update({ where: { id: serviceId }, data });
  } else {
    await db.service.create({ data });
  }
  refreshAll();
  redirect(`${listPath(data.kind)}?saved=1`);
}

export async function toggleService(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = id.safeParse(formData.get("id"));
  if (!parsed.success) return failure(t.common.invalidForm);
  const s = await db.service.findUnique({ where: { id: parsed.data } });
  if (!s) return failure(t.common.invalidForm);
  await db.service.update({ where: { id: s.id }, data: { active: !s.active } });
  refreshAll();
  return success(t.admin.services.saved);
}

export async function deleteService(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = id.safeParse(formData.get("id"));
  if (!parsed.success) return failure(t.common.invalidForm);
  // Appointments keep their serviceName snapshot; serviceId becomes null.
  await db.service.delete({ where: { id: parsed.data } });
  refreshAll();
  return success(t.admin.services.deleted);
}

export async function savePrices(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const ids = formData.getAll("id").map(String);
  const priceSchema = z.preprocess(
    (v) => (v === "" || v == null ? null : Number(String(v).replace(/\s/g, ""))),
    z.number().int().min(0).max(1_000_000_000).nullable(),
  );
  const updates: { id: string; price: number | null; priceFrom: boolean }[] = [];
  const errors: Record<string, string[]> = {};
  for (const sid of ids) {
    const parsed = priceSchema.safeParse(formData.get(`price_${sid}`));
    if (!parsed.success) {
      errors[`price_${sid}`] = ["Noto'g'ri narx."];
      continue;
    }
    updates.push({ id: sid, price: parsed.data, priceFrom: formData.get(`from_${sid}`) === "on" });
  }
  if (Object.keys(errors).length) return failure(t.common.invalidForm, errors);
  await db.$transaction(updates.map((u) => db.service.update({ where: { id: u.id }, data: { price: u.price, priceFrom: u.priceFrom } })));
  refreshAll();
  return success(t.admin.prices.saved);
}
