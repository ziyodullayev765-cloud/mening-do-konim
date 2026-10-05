import type { AppointmentStatus } from "@prisma/client";
import { Inbox } from "lucide-react";
import { getT } from "@/lib/i18n/server";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-3xl text-ink lg:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  NEW: "bg-accent-soft text-accent-strong border-accent/20",
  CONFIRMED: "bg-[#e6ecf6] text-[#27477a] border-[#27477a]/15",
  COMPLETED: "bg-success-soft text-success border-success/20",
  CANCELLED: "bg-danger-soft text-danger border-danger/20",
  RESCHEDULED: "bg-warning-soft text-warning border-warning/20",
};

export async function StatusBadge({ status }: { status: AppointmentStatus }) {
  const t = await getT();
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[status]}`}>
      {t.status[status]}
    </span>
  );
}

export function EmptyState({ message, children }: { message: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface/50 px-6 py-14 text-center">
      <Inbox className="size-8 text-muted/60" strokeWidth={1.5} aria-hidden />
      <p className="mt-3 text-muted">{message}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function Panel({ title, children, className = "", actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={`card ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-ink">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
