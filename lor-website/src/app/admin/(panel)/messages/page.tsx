import type { Metadata } from "next";
import { Mail, Phone, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getL, getT } from "@/lib/i18n/server";
import { formatDateTime } from "@/lib/format";
import { getSettings } from "@/lib/slots";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { deleteMessage, deleteMessages, toggleMessageRead } from "@/app/admin/actions/content";
import { BULK_FORM, BulkDeleteBar, SelectAll } from "@/components/admin/BulkDelete";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.messages };
}

export default async function MessagesPage() {
  const [t, L] = await Promise.all([getT(), getL()]);
  await requireAdmin();
  const [items, settings] = await Promise.all([
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    getSettings(),
  ]);
  return (
    <>
      <PageHeader title={t.admin.nav.messages} />
      {items.length === 0 ? (
        <EmptyState message={t.admin.messages.empty} />
      ) : (
        <>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink">
            <SelectAll label={L("Hammasini tanlash", "Выбрать все")} /> {L("Hammasini tanlash", "Выбрать все")}
          </label>
          {items.some((m) => m.isRead) && (
            <ActionForm action={deleteMessages}>
              <input type="hidden" name="scope" value="read" />
              <ConfirmButton
                message={L("Barcha o'qilgan xabarlar butunlay o'chiriladi. Davom etasizmi?", "Все прочитанные сообщения будут удалены навсегда. Продолжить?")}
                confirmLabel={L("O'chirish", "Удалить")}
                className="btn btn-secondary btn-sm !text-danger"
              >
                <Trash2 className="size-4" aria-hidden /> {L("O'qilganlarni o'chirish", "Удалить прочитанные")}
              </ConfirmButton>
            </ActionForm>
          )}
        </div>
        <ul className="space-y-3">
          {items.map((m) => (
            <li key={m.id} className={`card p-5 has-[:checked]:!border-danger/50 ${m.isRead ? "" : "border-accent/40"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                <input type="checkbox" name="id" value={m.id} form={BULK_FORM} aria-label={m.name} className="mt-1 size-4 shrink-0 accent-[var(--color-accent)]" />
                <div>
                  <p className="font-semibold text-ink">
                    {m.name}
                    {!m.isRead && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">{t.admin.messages.unread}</span>}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                    <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1.5 tabular-nums hover:text-accent"><Phone className="size-3.5" aria-hidden />{m.phone}</a>
                    {m.email && <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 hover:text-accent"><Mail className="size-3.5" aria-hidden />{m.email}</a>}
                  </p>
                </div>
                </div>
                <time className="text-sm text-muted tabular-nums">{formatDateTime(m.createdAt, settings.timezone)}</time>
              </div>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-text">{m.message}</p>
              <div className="mt-4 flex justify-end gap-2 border-t border-line pt-3">
                <ActionForm action={toggleMessageRead}>
                  <input type="hidden" name="id" value={m.id} />
                  <SubmitButton className="btn btn-ghost btn-sm">{m.isRead ? t.admin.messages.markUnread : t.admin.messages.markRead}</SubmitButton>
                </ActionForm>
                <ActionForm action={deleteMessage}>
                  <input type="hidden" name="id" value={m.id} />
                  <ConfirmButton message={t.admin.services.deleteConfirm} className="btn btn-ghost btn-sm !text-danger">
                    <Trash2 className="size-4" aria-hidden /> {t.admin.services.delete}
                  </ConfirmButton>
                </ActionForm>
              </div>
            </li>
          ))}
        </ul>
        <BulkDeleteBar action={deleteMessages} what="messages" />
        </>
      )}
    </>
  );
}
