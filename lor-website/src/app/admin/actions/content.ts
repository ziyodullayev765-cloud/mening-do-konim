"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";
import { getL, getT } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { deleteUnusedMedia } from "@/lib/media";
import { failure, success, type ActionState } from "@/lib/action";
import { adminSchemasFor, fieldErrors, id } from "@/lib/validation";

function refreshSite() {
  revalidatePath("/", "layout");
}

/* ---------- Doctor profile ---------- */

export async function saveProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = adminSchemasFor(t).doctorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure(t.common.invalidForm, fieldErrors(parsed.error));
  const data = {
    ...parsed.data,
    photoUrl: parsed.data.photoUrl || null,
    aboutPhotoUrl: parsed.data.aboutPhotoUrl || null,
    logoUrl: parsed.data.logoUrl || null,
  };
  const before = await db.doctor.findUnique({ where: { id: 1 }, select: { photoUrl: true, aboutPhotoUrl: true, logoUrl: true } });
  await db.doctor.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
  // Remove uploads that were replaced or cleared.
  if (before) await deleteUnusedMedia([before.photoUrl, before.aboutPhotoUrl, before.logoUrl]);
  refreshSite();
  return success(t.admin.profile.saved);
}

/* ---------- Testimonials ---------- */

export async function saveTestimonial(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = adminSchemasFor(t).testimonialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure(t.common.invalidForm, fieldErrors(parsed.error));
  const tid = formData.get("id");
  if (typeof tid === "string" && tid) {
    await db.testimonial.update({ where: { id: tid }, data: parsed.data });
  } else {
    const max = await db.testimonial.aggregate({ _max: { sortOrder: true } });
    await db.testimonial.create({ data: { ...parsed.data, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
  }
  refreshSite();
  return success(t.admin.services.saved);
}

export async function deleteTestimonial(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = id.safeParse(formData.get("id"));
  if (!parsed.success) return failure(t.common.invalidForm);
  await db.testimonial.delete({ where: { id: parsed.data } });
  refreshSite();
  return success(t.admin.services.deleted);
}

export async function toggleTestimonial(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = id.safeParse(formData.get("id"));
  if (!parsed.success) return failure(t.common.invalidForm);
  const item = await db.testimonial.findUnique({ where: { id: parsed.data } });
  if (!item) return failure(t.common.invalidForm);
  await db.testimonial.update({ where: { id: item.id }, data: { active: !item.active } });
  refreshSite();
  return success(t.admin.services.saved);
}

/* ---------- FAQ ---------- */

export async function saveFaq(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = adminSchemasFor(t).faqSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure(t.common.invalidForm, fieldErrors(parsed.error));
  const fid = formData.get("id");
  if (typeof fid === "string" && fid) {
    await db.faq.update({ where: { id: fid }, data: parsed.data });
  } else {
    const max = await db.faq.aggregate({ _max: { sortOrder: true } });
    await db.faq.create({ data: { ...parsed.data, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
  }
  refreshSite();
  return success(t.admin.services.saved);
}

export async function deleteFaq(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = id.safeParse(formData.get("id"));
  if (!parsed.success) return failure(t.common.invalidForm);
  await db.faq.delete({ where: { id: parsed.data } });
  refreshSite();
  return success(t.admin.services.deleted);
}

/** Swaps the FAQ with its neighbour. formData: id, direction ("up" | "down"). */
export async function moveFaq(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = id.safeParse(formData.get("id"));
  const direction = formData.get("direction");
  if (!parsed.success || (direction !== "up" && direction !== "down")) return failure(t.common.invalidForm);

  const all = await db.faq.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true } });
  const index = all.findIndex((f) => f.id === parsed.data);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= all.length) return success();
  [all[index], all[target]] = [all[target], all[index]];
  // Normalise sort order to 0..n-1 so ordering stays stable.
  await db.$transaction(all.map((f, i) => db.faq.update({ where: { id: f.id }, data: { sortOrder: i } })));
  refreshSite();
  return success();
}

/* ---------- Contact messages ---------- */

export async function toggleMessageRead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = id.safeParse(formData.get("id"));
  if (!parsed.success) return failure(t.common.invalidForm);
  const msg = await db.contactMessage.findUnique({ where: { id: parsed.data } });
  if (!msg) return failure(t.common.invalidForm);
  await db.contactMessage.update({ where: { id: msg.id }, data: { isRead: !msg.isRead } });
  revalidatePath("/admin", "layout");
  return success();
}

export async function deleteMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  await requireAdmin();
  const parsed = id.safeParse(formData.get("id"));
  if (!parsed.success) return failure(t.common.invalidForm);
  await db.contactMessage.delete({ where: { id: parsed.data } });
  revalidatePath("/admin", "layout");
  return success(t.admin.services.deleted);
}

/** Deletes the ticked messages (repeated `id`), or every read message when `scope=read`. */
export async function deleteMessages(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const L = await getL();
  let count: number;
  if (formData.get("scope") === "read") {
    ({ count } = await db.contactMessage.deleteMany({ where: { isRead: true } }));
  } else {
    const parsed = z.array(id).min(1).max(500).safeParse(formData.getAll("id"));
    if (!parsed.success) return failure(L("Hech qanday xabar tanlanmagan.", "Не выбрано ни одного сообщения."));
    ({ count } = await db.contactMessage.deleteMany({ where: { id: { in: parsed.data } } }));
  }
  revalidatePath("/admin", "layout");
  return success(L(`O'chirildi: ${count} ta xabar.`, `Удалено сообщений: ${count}.`));
}
