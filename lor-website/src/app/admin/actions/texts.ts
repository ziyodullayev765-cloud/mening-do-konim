"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { dictionaries, LOCALES } from "@/lib/i18n";
import { getL } from "@/lib/i18n/server";
import { EDITABLE_PATHS, MAX_TEXT_LENGTH, getPath } from "@/lib/i18n/texts";
import { requireAdmin } from "@/lib/auth";
import { success, type ActionState } from "@/lib/action";

/** Saves Admin → Site texts. Only texts that differ from the built-in default are stored. */
export async function saveTexts(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const L = await getL();
  const texts: Record<string, Record<string, string>> = { uz: {}, ru: {} };
  for (const locale of LOCALES) {
    for (const path of EDITABLE_PATHS) {
      const raw = formData.get(`${locale}|${path}`);
      if (typeof raw !== "string") continue;
      const value = raw.replace(/\r\n/g, "\n").trim().slice(0, MAX_TEXT_LENGTH);
      if (value && value !== getPath(dictionaries[locale], path)) texts[locale][path] = value;
    }
  }
  await db.setting.upsert({ where: { id: 1 }, create: { id: 1, texts }, update: { texts } });
  revalidatePath("/", "layout");
  const n = Object.keys(texts.uz).length + Object.keys(texts.ru).length;
  return success(L(`Saqlandi. O'zgartirilgan matnlar: ${n} ta.`, `Сохранено. Изменённых текстов: ${n}.`));
}
