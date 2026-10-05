"use client";

import { useEffect, useState, useTransition } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, LoaderCircle } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatDuration, formatPrice } from "@/lib/format";
import { SERVICE_ICONS } from "@/lib/icons";
import {
  SERVICE_CATEGORIES,
  emptyServiceForm,
  isProcedureCategory,
  serviceFormSchema,
  type ServiceFormInput,
  type ServiceFormOutput,
} from "@/lib/schemas/service";
import { saveService } from "@/app/admin/actions/services";
import { Modal } from "../Modal";
import { toast } from "../toast";
import { CATEGORY_STYLES } from "./CategoryBadge";
import type { ServiceRow } from "./types";

const ui = t.admin.servicesUi;
const f = ui.fields;

function toFormValues(row: ServiceRow): ServiceFormInput {
  return {
    name: row.name,
    category: row.category,
    description: row.description,
    price: row.price == null ? "" : String(row.price),
    priceFrom: row.priceFrom,
    durationMinutes: row.durationMinutes == null ? "" : String(row.durationMinutes),
    icon: (row.icon in SERVICE_ICONS ? row.icon : "stethoscope") as ServiceFormInput["icon"],
    imageUrl: row.imageUrl ?? "",
    indication: row.indication,
    recovery: row.recovery,
    showInPricing: row.showInPricing,
    active: row.active,
    sortOrder: String(row.sortOrder),
  };
}

type Props = {
  open: boolean;
  /** null = create mode */
  service: ServiceRow | null;
  onClose: () => void;
};

/**
 * The form is mounted fresh on every open, so default values come straight
 * from the row — no reset() effect that could overwrite what the user types.
 */
export function ServiceFormModal(props: Props) {
  if (!props.open) return null;
  return <ServiceFormDialog {...props} />;
}

function ServiceFormDialog({ service, onClose }: Props) {
  const [saving, startSaving] = useTransition();
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const form = useForm<ServiceFormInput, unknown, ServiceFormOutput>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: service ? toFormValues(service) : emptyServiceForm,
    // Validate on first submit, then live while typing — no layout jumps on blur.
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, handleSubmit, control, setError, watch, getValues, setFocus, formState } = form;
  const { errors, isDirty } = formState;

  useEffect(() => {
    // Focus the first field once the dialog is shown.
    const id = requestAnimationFrame(() => setFocus("name"));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestClose = () => {
    if (saving) return;
    if (isDirty && !confirmDiscard) setConfirmDiscard(true);
    else onClose();
  };

  const onSubmit = handleSubmit(() => {
    // Send the raw input: the server re-validates it with the same schema.
    const values = getValues();
    startSaving(async () => {
      const res = await saveService(service?.id ?? null, values);
      if (res.ok) {
        toast(res.message ?? ui.updated);
        onClose();
        return;
      }
      if (res.errors) {
        let first: FieldPath<ServiceFormInput> | null = null;
        for (const [key, messages] of Object.entries(res.errors)) {
          const name = key as FieldPath<ServiceFormInput>;
          setError(name, { type: "server", message: messages[0] });
          first ??= name;
        }
        if (first) setFocus(first);
      }
      toast(res.message ?? t.common.serverError, "error");
    });
  });

  const category = watch("category");
  const showProcedureFields = isProcedureCategory(category);

  return (
    <Modal
      open
      onRequestClose={requestClose}
      size="lg"
      title={service ? ui.editTitle : ui.createTitle}
      description={service?.name}
      footer={
        confirmDiscard ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <div>
              <p className="font-semibold text-ink">{ui.unsavedTitle}</p>
              <p className="text-sm text-muted">{ui.unsavedLead}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirmDiscard(false)}>{ui.keepEditing}</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={onClose}>{ui.discard}</button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={requestClose} disabled={saving}>{t.common.cancel}</button>
            <button type="submit" form="service-form" className="btn btn-dark min-w-32" disabled={saving}>
              {saving && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              {t.common.save}
            </button>
          </div>
        )
      }
    >
      <form id="service-form" onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[1fr_17rem]">
        <fieldset disabled={saving} className="min-w-0 space-y-8">
          {/* Main */}
          <Section title={ui.sections.main}>
            <Field label={f.name} error={errors.name?.message} htmlFor="sf-name" required>
              <input id="sf-name" className="input" placeholder={f.namePlaceholder} autoComplete="off" aria-invalid={!!errors.name} {...register("name")} />
            </Field>

            <fieldset>
              <legend className="label">{f.category}</legend>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <div role="radiogroup" aria-label={f.category} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {SERVICE_CATEGORIES.map((c) => {
                      const selected = field.value === c;
                      return (
                        <label
                          key={c}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                            selected ? "border-accent bg-accent-soft/60 text-ink" : "border-line bg-surface text-muted hover:border-line-strong"
                          }`}
                        >
                          <input type="radio" className="sr-only" name={field.name} value={c} checked={selected} onChange={() => field.onChange(c)} onBlur={field.onBlur} />
                          <span className={`size-2 shrink-0 rounded-full ${CATEGORY_STYLES[c].dot}`} aria-hidden />
                          {t.admin.categories[c]}
                        </label>
                      );
                    })}
                  </div>
                )}
              />
              <FieldError message={errors.category?.message} />
            </fieldset>

            <Field label={f.description} error={errors.description?.message} htmlFor="sf-desc" optional>
              <textarea id="sf-desc" rows={3} className="input" placeholder={f.descriptionPlaceholder} aria-invalid={!!errors.description} {...register("description")} />
            </Field>
          </Section>

          {/* Price & duration */}
          <Section title={ui.sections.price}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={f.price} hint={f.priceHint} error={errors.price?.message} htmlFor="sf-price">
                <div className="relative">
                  <input id="sf-price" inputMode="numeric" className="input pr-14 tabular-nums" placeholder="250 000" autoComplete="off" aria-invalid={!!errors.price} {...register("price")} />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted">{t.common.currency}</span>
                </div>
              </Field>
              <Field label={f.duration} hint={f.durationHint} error={errors.durationMinutes?.message} htmlFor="sf-duration">
                <div className="relative">
                  <input id="sf-duration" inputMode="numeric" className="input pr-14 tabular-nums" placeholder="30" autoComplete="off" aria-invalid={!!errors.durationMinutes} {...register("durationMinutes")} />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted">{t.common.minutesShort}</span>
                </div>
              </Field>
            </div>
            <div>
              <Checkbox label={f.priceFrom} {...register("priceFrom")} />
              <FieldError message={errors.priceFrom?.message} />
            </div>
          </Section>

          {/* Procedure-only details */}
          {showProcedureFields && (
            <Section title={ui.sections.procedure} hint={f.procedureHint}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={f.indication} error={errors.indication?.message} htmlFor="sf-ind" optional>
                  <textarea id="sf-ind" rows={2} className="input" {...register("indication")} />
                </Field>
                <Field label={f.recovery} error={errors.recovery?.message} htmlFor="sf-rec" optional>
                  <textarea id="sf-rec" rows={2} className="input" {...register("recovery")} />
                </Field>
              </div>
            </Section>
          )}

          {/* Display */}
          <Section title={ui.sections.display}>
            <fieldset>
              <legend className="label">{f.icon}</legend>
              <Controller
                control={control}
                name="icon"
                render={({ field }) => (
                  <div role="radiogroup" aria-label={f.icon} className="grid grid-cols-7 gap-1.5">
                    {Object.entries(SERVICE_ICONS).map(([key, { icon: Icon, label }]) => {
                      const selected = field.value === key;
                      return (
                        <label
                          key={key}
                          title={label}
                          className={`grid aspect-square cursor-pointer place-items-center rounded-lg border transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                            selected ? "border-accent bg-accent text-white" : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
                          }`}
                        >
                          <input type="radio" className="sr-only" name={field.name} value={key} checked={selected} onChange={() => field.onChange(key)} aria-label={label} />
                          <Icon className="size-[18px]" strokeWidth={1.7} aria-hidden />
                        </label>
                      );
                    })}
                  </div>
                )}
              />
              <FieldError message={errors.icon?.message} />
            </fieldset>
            <div className="grid gap-5 sm:grid-cols-[9rem]">
              <Field label={f.sortOrder} hint={f.sortOrderHint} error={errors.sortOrder?.message} htmlFor="sf-sort">
                <input id="sf-sort" inputMode="numeric" className="input tabular-nums" aria-invalid={!!errors.sortOrder} {...register("sortOrder")} />
              </Field>
            </div>
            <div className="space-y-3">
              <Checkbox label={f.active} {...register("active")} />
            </div>
          </Section>
        </fieldset>

        <Preview values={watch()} />
      </form>
    </Modal>
  );
}

/** Live preview of how the card will look on the public site. */
function Preview({ values }: { values: ServiceFormInput }) {
  const Icon = (SERVICE_ICONS[values.icon as keyof typeof SERVICE_ICONS] ?? SERVICE_ICONS.stethoscope).icon;
  const parsed = serviceFormSchema.safeParse(values);
  const price = parsed.success ? parsed.data.price : null;
  const duration = parsed.success ? formatDuration(parsed.data.durationMinutes) : null;
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-0">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.admin.servicesUi.preview}</p>
        <div className={`card p-5 transition-opacity ${values.active ? "" : "opacity-50"}`}>
          <span className="grid size-10 place-items-center rounded-lg border border-line bg-accent-soft/60 text-accent">
            <Icon className="size-5" strokeWidth={1.6} aria-hidden />
          </span>
          <p className="mt-4 font-semibold break-words text-ink">{values.name || "—"}</p>
          {values.description && <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted">{values.description}</p>}
          <div className="mt-4 border-t border-line pt-4">
            <p className={`font-semibold tabular-nums ${price == null ? "text-sm text-muted" : "text-ink"}`}>
              {formatPrice(price, values.priceFrom && price != null)}
            </p>
            {duration && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted"><Clock className="size-3.5" aria-hidden />{duration}</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{title}</h3>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label, htmlFor, error, hint, optional, required, children,
}: {
  label: string; htmlFor: string; error?: string; hint?: string; optional?: boolean; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="text-danger" aria-hidden> *</span>}
        {optional && <span className="font-normal text-muted"> ({t.common.optional})</span>}
      </label>
      {children}
      {error ? <FieldError message={error} /> : hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="mt-1.5 text-sm text-danger">{message}</p>;
}

function Checkbox({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-ink">
      <input type="checkbox" className="size-4 accent-[var(--color-accent)]" {...props} />
      {label}
    </label>
  );
}
