import Link from "next/link";
import type { Service, ServiceKind } from "@prisma/client";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { formatDuration, formatPrice } from "@/lib/format";
import { SERVICE_ICONS, serviceIcon } from "@/lib/icons";
import { deleteService, saveService, toggleService } from "@/app/admin/actions/services";
import { ActionForm, SubmitButton } from "./ActionForm";
import { ConfirmButton } from "./ConfirmButton";
import { Checkbox, SelectField, TextArea, TextField } from "./fields";
import { FlashToast } from "./FlashToast";
import { EmptyState, PageHeader, Panel } from "./ui";

const base = (kind: ServiceKind) => (kind === "PROCEDURE" ? "/admin/procedures" : "/admin/services");

export async function ServiceList({ kind, saved }: { kind: ServiceKind; saved?: boolean }) {
  const items = await db.service.findMany({ where: { kind }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  const isProc = kind === "PROCEDURE";
  return (
    <>
      {saved && <FlashToast message={t.admin.services.saved} />}
      <PageHeader
        title={isProc ? t.admin.nav.procedures : t.admin.nav.services}
        actions={
          <Link href={`${base(kind)}/new`} className="btn btn-primary">
            <Plus className="size-4" aria-hidden /> {isProc ? t.admin.services.addProcedure : t.admin.services.add}
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState message={isProc ? t.admin.services.emptyProcedures : t.admin.services.empty} />
      ) : (
        <ul className="space-y-3">
          {items.map((s) => {
            const Icon = serviceIcon(s.icon);
            return (
              <li key={s.id} className={`card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5 ${s.active ? "" : "opacity-60"}`}>
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">
                    {s.name}
                    {!s.active && <span className="ml-2 rounded bg-paper-2 px-1.5 py-0.5 text-xs font-medium text-muted">{t.admin.services.disabled}</span>}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {formatPrice(s.price, s.priceFrom)}
                    {s.durationMinutes ? ` · ${formatDuration(s.durationMinutes)}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionForm action={toggleService}>
                    <input type="hidden" name="id" value={s.id} />
                    <SubmitButton className="btn btn-secondary btn-sm">{s.active ? t.admin.services.disable : t.admin.services.enable}</SubmitButton>
                  </ActionForm>
                  <Link href={`${base(kind)}/${s.id}`} className="btn btn-secondary btn-sm">
                    <Pencil className="size-3.5" aria-hidden /> {t.admin.services.edit}
                  </Link>
                  <ActionForm action={deleteService}>
                    <input type="hidden" name="id" value={s.id} />
                    <ConfirmButton message={t.admin.services.deleteConfirm} className="btn btn-ghost btn-sm !text-danger">
                      <Trash2 className="size-4" aria-hidden />
                      <span className="sr-only">{t.admin.services.delete}</span>
                    </ConfirmButton>
                  </ActionForm>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export function ServiceForm({ kind, service }: { kind: ServiceKind; service?: Service }) {
  const isProc = kind === "PROCEDURE";
  return (
    <>
      <PageHeader
        title={service ? service.name : isProc ? t.admin.services.addProcedure : t.admin.services.add}
        actions={<Link href={base(kind)} className="btn btn-ghost">{t.common.cancel}</Link>}
      />
      <ActionForm action={saveService}>
        <input type="hidden" name="kind" value={kind} />
        {service && <input type="hidden" name="id" value={service.id} />}
        <Panel>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField name="name" label={t.admin.services.name} defaultValue={service?.name} required className="md:col-span-2" />
            <TextArea name="description" label={t.admin.services.description} defaultValue={service?.description} rows={3} className="md:col-span-2" />
            <TextField name="price" type="number" min={0} step={1000} inputMode="numeric" label={t.admin.services.price} hint={t.admin.services.pricePlaceholder} defaultValue={service?.price ?? ""} />
            <TextField name="durationMinutes" type="number" min={1} label={t.admin.services.duration} defaultValue={service?.durationMinutes ?? ""} />
            {isProc && (
              <>
                <TextArea name="indication" label={t.admin.services.indication} defaultValue={service?.indication} rows={2} />
                <TextArea name="recovery" label={t.admin.services.recovery} defaultValue={service?.recovery} rows={2} />
              </>
            )}
            <SelectField
              name="icon"
              label={t.admin.services.icon}
              defaultValue={service?.icon ?? (isProc ? "scissors" : "stethoscope")}
              options={Object.entries(SERVICE_ICONS).map(([value, v]) => ({ value, label: v.label }))}
            />
            <TextField name="imageUrl" type="url" label={t.admin.services.imageUrl} placeholder="https://…" defaultValue={service?.imageUrl ?? ""} />
            <TextField name="sortOrder" type="number" label={t.admin.services.sortOrder} defaultValue={service?.sortOrder ?? 0} />
            <div className="flex flex-col justify-end gap-3 md:col-span-2">
              <Checkbox name="priceFrom" label={t.admin.services.priceFrom} defaultChecked={service?.priceFrom ?? isProc} />
              <Checkbox name="showInPricing" label={t.admin.services.showInPricing} defaultChecked={service?.showInPricing ?? true} />
              <Checkbox name="active" label={t.admin.services.active} defaultChecked={service?.active ?? true} />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-2 border-t border-line pt-5">
            <Link href={base(kind)} className="btn btn-ghost">{t.common.cancel}</Link>
            <SubmitButton>{t.common.save}</SubmitButton>
          </div>
        </Panel>
      </ActionForm>
    </>
  );
}
