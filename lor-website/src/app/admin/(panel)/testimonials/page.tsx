import type { Metadata } from "next";
import { Star, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Checkbox, TextArea, TextField } from "@/components/admin/fields";
import { EmptyState, PageHeader, Panel } from "@/components/admin/ui";
import { deleteTestimonial, saveTestimonial, toggleTestimonial } from "@/app/admin/actions/content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.testimonials };
}

async function TestimonialFields({ item }: { item?: { patientName: string; text: string; rating: number | null; active: boolean } }) {
  const t = await getT();
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
      <TextField name="patientName" label={t.admin.testimonials.patientName} defaultValue={item?.patientName} required />
      <TextField name="rating" type="number" min={1} max={5} label={t.admin.testimonials.rating} defaultValue={item?.rating ?? ""} />
      <TextArea name="text" label={t.admin.testimonials.text} defaultValue={item?.text} rows={3} required className="sm:col-span-2" />
      <Checkbox name="active" label={t.admin.services.active} defaultChecked={item?.active ?? true} />
    </div>
  );
}

export default async function TestimonialsPage() {
  const t = await getT();
  await requireAdmin();
  const items = await db.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return (
    <>
      <PageHeader title={t.admin.nav.testimonials} />
      <Panel title={t.admin.testimonials.add} className="mb-6">
        <ActionForm action={saveTestimonial} resetOnSuccess>
          <TestimonialFields />
          <div className="mt-5 flex justify-end"><SubmitButton>{t.common.save}</SubmitButton></div>
        </ActionForm>
      </Panel>

      {items.length === 0 ? (
        <EmptyState message={t.admin.testimonials.empty} />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className={`card ${item.active ? "" : "opacity-60"}`}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-start gap-4 p-5 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">
                      {item.patientName}
                      {item.rating != null && (
                        <span className="ml-2 inline-flex items-center gap-0.5 text-sm font-medium text-gold">
                          <Star className="size-3.5 fill-gold" aria-hidden /> {item.rating}
                        </span>
                      )}
                      {!item.active && <span className="ml-2 rounded bg-paper-2 px-1.5 py-0.5 text-xs font-medium text-muted">{t.admin.services.disabled}</span>}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{item.text}</p>
                  </div>
                  <span className="btn btn-secondary btn-sm group-open:hidden">{t.admin.services.edit}</span>
                </summary>
                <div className="border-t border-line p-5">
                  <ActionForm action={saveTestimonial}>
                    <input type="hidden" name="id" value={item.id} />
                    <TestimonialFields item={item} />
                    <div className="mt-5 flex justify-end"><SubmitButton>{t.common.save}</SubmitButton></div>
                  </ActionForm>
                </div>
              </details>
              <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
                <ActionForm action={toggleTestimonial}>
                  <input type="hidden" name="id" value={item.id} />
                  <SubmitButton className="btn btn-ghost btn-sm">{item.active ? t.admin.services.disable : t.admin.services.enable}</SubmitButton>
                </ActionForm>
                <ActionForm action={deleteTestimonial}>
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmButton message={t.admin.services.deleteConfirm} className="btn btn-ghost btn-sm !text-danger">
                    <Trash2 className="size-4" aria-hidden /> {t.admin.services.delete}
                  </ConfirmButton>
                </ActionForm>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
