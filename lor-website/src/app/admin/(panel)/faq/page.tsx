import type { Metadata } from "next";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Checkbox, TextArea, TextField } from "@/components/admin/fields";
import { EmptyState, PageHeader, Panel } from "@/components/admin/ui";
import { deleteFaq, moveFaq, saveFaq } from "@/app/admin/actions/content";

export const metadata: Metadata = { title: t.admin.nav.faq };

function FaqFields({ item }: { item?: { question: string; answer: string; questionRu: string; answerRu: string; active: boolean } }) {
  return (
    <div className="grid gap-4">
      <TextField name="question" label={t.admin.faq.question} defaultValue={item?.question} required />
      <TextArea name="answer" label={t.admin.faq.answer} defaultValue={item?.answer} rows={3} required />
      <TextField name="questionRu" label={`${t.admin.faq.question} (RU)`} defaultValue={item?.questionRu} />
      <TextArea name="answerRu" label={`${t.admin.faq.answer} (RU)`} defaultValue={item?.answerRu} rows={3} />
      <Checkbox name="active" label={t.admin.services.active} defaultChecked={item?.active ?? true} />
    </div>
  );
}

export default async function FaqPage() {
  await requireAdmin();
  const items = await db.faq.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return (
    <>
      <PageHeader title={t.admin.nav.faq} />
      <Panel title={t.admin.faq.add} className="mb-6">
        <ActionForm action={saveFaq} resetOnSuccess>
          <FaqFields />
          <div className="mt-5 flex justify-end"><SubmitButton>{t.common.save}</SubmitButton></div>
        </ActionForm>
      </Panel>

      {items.length === 0 ? (
        <EmptyState message={t.admin.faq.empty} />
      ) : (
        <ol className="space-y-3">
          {items.map((item, i) => (
            <li key={item.id} className={`card flex ${item.active ? "" : "opacity-60"}`}>
              <ActionForm action={moveFaq} className="flex flex-col justify-center gap-1 border-r border-line p-2">
                <input type="hidden" name="id" value={item.id} />
                <SubmitButton name="direction" value="up" disabled={i === 0} className="btn btn-ghost btn-sm !min-h-8 !px-2" aria-label={t.admin.faq.moveUp}>
                  <ArrowUp className="size-4" aria-hidden />
                </SubmitButton>
                <SubmitButton name="direction" value="down" disabled={i === items.length - 1} className="btn btn-ghost btn-sm !min-h-8 !px-2" aria-label={t.admin.faq.moveDown}>
                  <ArrowDown className="size-4" aria-hidden />
                </SubmitButton>
              </ActionForm>
              <details className="group min-w-0 flex-1">
                <summary className="flex cursor-pointer list-none items-center gap-4 p-5 [&::-webkit-details-marker]:hidden">
                  <p className="min-w-0 flex-1 font-semibold text-ink">
                    {item.question}
                    {!item.active && <span className="ml-2 rounded bg-paper-2 px-1.5 py-0.5 text-xs font-medium text-muted">{t.admin.services.disabled}</span>}
                  </p>
                  <span className="btn btn-secondary btn-sm group-open:hidden">{t.admin.services.edit}</span>
                </summary>
                <div className="border-t border-line p-5">
                  <ActionForm action={saveFaq}>
                    <input type="hidden" name="id" value={item.id} />
                    <FaqFields item={item} />
                    <div className="mt-5 flex justify-end"><SubmitButton>{t.common.save}</SubmitButton></div>
                  </ActionForm>
                  <ActionForm action={deleteFaq} className="mt-3 flex justify-end border-t border-line pt-3">
                    <input type="hidden" name="id" value={item.id} />
                    <ConfirmButton message={t.admin.services.deleteConfirm} className="btn btn-ghost btn-sm !text-danger">
                      <Trash2 className="size-4" aria-hidden /> {t.admin.services.delete}
                    </ConfirmButton>
                  </ActionForm>
                </div>
              </details>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
