import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { dictionaries } from "@/lib/i18n";
import { getL, getT } from "@/lib/i18n/server";
import { TEXT_GROUPS, getPath, parseOverrides } from "@/lib/i18n/texts";
import { PageHeader } from "@/components/admin/ui";
import { TextsEditor, type EditorGroup } from "@/components/admin/TextsEditor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.texts };
}

export default async function TextsPage() {
  await requireAdmin();
  const [t, L] = await Promise.all([getT(), getL()]);
  const s = await db.setting.findUnique({ where: { id: 1 }, select: { texts: true } });
  const saved = parseOverrides(s?.texts);
  const groups: EditorGroup[] = TEXT_GROUPS.map((g) => ({
    id: g.id,
    title: L(g.uz, g.ru),
    fields: g.fields.map((f) => ({
      path: f.path,
      label: L(f.uz, f.ru),
      long: Boolean(f.long),
      defaults: { uz: getPath(dictionaries.uz, f.path), ru: getPath(dictionaries.ru, f.path) },
      values: {
        uz: saved.uz?.[f.path] || getPath(dictionaries.uz, f.path),
        ru: saved.ru?.[f.path] || getPath(dictionaries.ru, f.path),
      },
    })),
  }));
  return (
    <>
      <PageHeader
        title={t.admin.nav.texts}
        description={L(
          "Saytdagi sarlavha, tugma va izohlarni o'zbek va rus tilida o'zgartiring. Bo'sh qoldirilgan maydon asl matnga qaytadi.",
          "Меняйте заголовки, кнопки и подписи сайта на узбекском и русском. Пустое поле возвращает исходный текст.",
        )}
      />
      <TextsEditor groups={groups} />
    </>
  );
}
