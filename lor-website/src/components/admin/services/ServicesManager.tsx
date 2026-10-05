"use client";

import { useDeferredValue, useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { CalendarClock, Clock, Pencil, Plus, Search, SearchX, Stethoscope, Trash2, X } from "lucide-react";
import { useI18n } from "@/components/site/I18nProvider";
import { formatDuration, formatPrice } from "@/lib/format";
import { serviceIcon } from "@/lib/icons";
import { SERVICE_CATEGORIES } from "@/lib/schemas/service";
import { deleteService, setServiceActive } from "@/app/admin/actions/services";
import { Switch } from "../Switch";
import { toast } from "../toast";
import { CategoryBadge, CATEGORY_STYLES } from "./CategoryBadge";
import { DeleteServiceDialog } from "./DeleteServiceDialog";
import { ServiceFormModal } from "./ServiceFormModal";
import { SORT_KEYS, type Filters, type ServiceRow, type SortKey } from "./types";


type OptimisticAction =
  | { type: "patch"; id: string; patch: Partial<ServiceRow> }
  | { type: "remove"; id: string };

function reducer(rows: ServiceRow[], action: OptimisticAction): ServiceRow[] {
  switch (action.type) {
    case "patch":
      return rows.map((r) => (r.id === action.id ? { ...r, ...action.patch, pending: true } : r));
    case "remove":
      return rows.filter((r) => r.id !== action.id);
  }
}

/** Nulls always sort last regardless of direction. */
function byNullable(a: number | null, b: number | null, dir: 1 | -1) {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * dir;
}

const collator = new Intl.Collator("uz", { sensitivity: "base" });

function sortRows(rows: ServiceRow[], sort: SortKey) {
  const sorted = [...rows];
  switch (sort) {
    case "nameAsc": return sorted.sort((a, b) => collator.compare(a.name, b.name));
    case "priceAsc": return sorted.sort((a, b) => byNullable(a.price, b.price, 1));
    case "priceDesc": return sorted.sort((a, b) => byNullable(a.price, b.price, -1));
    case "durationAsc": return sorted.sort((a, b) => byNullable(a.durationMinutes, b.durationMinutes, 1));
    case "newest": return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    default: return sorted.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
  }
}

export function ServicesManager({ services, initialFilters }: { services: ServiceRow[]; initialFilters: Filters }) {
  const { t } = useI18n();
  const ui = t.admin.servicesUi;
  const [rows, applyOptimistic] = useOptimistic(services, reducer);
  const [, startTransition] = useTransition();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const deferredQuery = useDeferredValue(filters.q);

  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<ServiceRow | null>(null);

  // Keep filters in the URL (shareable, survives reload) without a server round-trip.
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category !== "ALL") params.set("category", filters.category);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.sort !== "manual") params.set("sort", filters.sort);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [filters]);

  const counts = useMemo(() => {
    const byCategory = Object.fromEntries(SERVICE_CATEGORIES.map((c) => [c, 0])) as Record<(typeof SERVICE_CATEGORIES)[number], number>;
    let active = 0;
    for (const r of rows) {
      byCategory[r.category] += 1;
      if (r.active) active += 1;
    }
    return { byCategory, active, total: rows.length };
  }, [rows]);

  const visible = useMemo(() => {
    const q = deferredQuery.trim().toLocaleLowerCase("uz");
    const filtered = rows.filter((r) => {
      if (filters.category !== "ALL" && r.category !== filters.category) return false;
      if (filters.status === "active" && !r.active) return false;
      if (filters.status === "inactive" && r.active) return false;
      if (q && !`${r.name} ${r.description}`.toLocaleLowerCase("uz").includes(q)) return false;
      return true;
    });
    return sortRows(filtered, filters.sort);
  }, [rows, deferredQuery, filters.category, filters.status, filters.sort]);

  const hasFilters = filters.q !== "" || filters.category !== "ALL" || filters.status !== "all";
  const set = (patch: Partial<Filters>) => setFilters((prev) => ({ ...prev, ...patch }));

  function toggleActive(row: ServiceRow, next: boolean) {
    startTransition(async () => {
      applyOptimistic({ type: "patch", id: row.id, patch: { active: next } });
      const res = await setServiceActive(row.id, next);
      // On failure the optimistic state is discarded automatically when the transition ends.
      toast(res.message ?? t.common.serverError, res.ok ? "success" : "error");
    });
  }

  function confirmDelete(row: ServiceRow) {
    setDeleting(null);
    startTransition(async () => {
      applyOptimistic({ type: "remove", id: row.id });
      const res = await deleteService(row.id);
      toast(res.message ?? t.common.serverError, res.ok ? "success" : "error");
    });
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(row: ServiceRow) {
    setEditing(row);
    setFormOpen(true);
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink lg:text-4xl">{ui.title}</h1>
          <p className="mt-1.5 max-w-xl text-[15px] text-muted">{ui.lead}</p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-primary">
          <Plus className="size-4" aria-hidden /> {ui.add}
        </button>
      </div>

      {/* Category tabs with counts */}
      <div role="tablist" aria-label={ui.columns.category} className="-mx-1 mb-4 flex gap-1 overflow-x-auto px-1 pb-1">
        {(["ALL", ...SERVICE_CATEGORIES] as const).map((c) => {
          const selected = filters.category === c;
          const count = c === "ALL" ? counts.total : counts.byCategory[c];
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => set({ category: c })}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                selected ? "border-ink bg-ink text-white" : "border-line bg-surface text-text hover:border-line-strong"
              }`}
            >
              {c !== "ALL" && <span className={`size-2 shrink-0 rounded-full ${CATEGORY_STYLES[c].dot}`} aria-hidden />}
              {c === "ALL" ? ui.allCategories : t.admin.categories[c]}
              <span className={`tabular-nums ${selected ? "text-white/60" : "text-muted"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="card mb-4 grid gap-3 p-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder={ui.search}
            aria-label={ui.search}
            className="input pl-9"
          />
        </div>
        <select value={filters.status} onChange={(e) => set({ status: e.target.value as Filters["status"] })} className="input" aria-label={ui.columns.active}>
          <option value="all">{ui.status.all}</option>
          <option value="active">{ui.status.active} ({counts.active})</option>
          <option value="inactive">{ui.status.inactive} ({counts.total - counts.active})</option>
        </select>
        <select value={filters.sort} onChange={(e) => set({ sort: e.target.value as SortKey })} className="input" aria-label={ui.sort.label}>
          {SORT_KEYS.map((k) => <option key={k} value={k}>{ui.sort[k]}</option>)}
        </select>
      </div>

      <div className="mb-3 flex min-h-8 items-center justify-between gap-3 text-sm text-muted" aria-live="polite">
        <span>{ui.count.replace("{shown}", String(visible.length)).replace("{total}", String(counts.total))}</span>
        {hasFilters && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => set({ q: "", category: "ALL", status: "all" })}>
            <X className="size-4" aria-hidden /> {ui.clearFilters}
          </button>
        )}
      </div>

      {/* Content */}
      {counts.total === 0 ? (
        <EmptyBlock icon={Stethoscope} title={ui.emptyTitle} lead={ui.emptyLead}>
          <button type="button" onClick={openCreate} className="btn btn-primary"><Plus className="size-4" aria-hidden /> {ui.add}</button>
        </EmptyBlock>
      ) : visible.length === 0 ? (
        <EmptyBlock icon={SearchX} title={ui.noResultsTitle} lead={ui.noResultsLead}>
          <button type="button" onClick={() => set({ q: "", category: "ALL", status: "all" })} className="btn btn-secondary">{ui.clearFilters}</button>
        </EmptyBlock>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-line bg-paper-2/50 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">{ui.columns.service}</th>
                  <th scope="col" className="w-40 px-4 py-3">{ui.columns.category}</th>
                  <th scope="col" className="hidden w-32 px-4 py-3 lg:table-cell">{ui.columns.duration}</th>
                  <th scope="col" className="w-48 px-4 py-3 text-right">{ui.columns.price}</th>
                  <th scope="col" className="w-24 px-4 py-3 text-center">{ui.columns.active}</th>
                  <th scope="col" className="w-28 px-5 py-3"><span className="sr-only">{t.admin.table.actions}</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((row) => (
                  <ServiceTableRow key={row.id} row={row} onEdit={openEdit} onDelete={setDeleting} onToggle={toggleActive} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {visible.map((row) => (
              <ServiceCard key={row.id} row={row} onEdit={openEdit} onDelete={setDeleting} onToggle={toggleActive} />
            ))}
          </ul>
        </>
      )}

      <ServiceFormModal open={formOpen} service={editing} onClose={() => setFormOpen(false)} />
      <DeleteServiceDialog
        service={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
        onHideInstead={(row) => {
          setDeleting(null);
          toggleActive(row, false);
        }}
      />
    </>
  );
}

type RowProps = {
  row: ServiceRow;
  onEdit: (row: ServiceRow) => void;
  onDelete: (row: ServiceRow) => void;
  onToggle: (row: ServiceRow, next: boolean) => void;
};

function ServiceTableRow({ row, onEdit, onDelete, onToggle }: RowProps) {
  const { t } = useI18n();
  const ui = t.admin.servicesUi;
  const Icon = serviceIcon(row.icon);
  const duration = formatDuration(row.durationMinutes, t);
  return (
    <tr className={`group transition-colors hover:bg-paper-2/40 ${row.active ? "" : "bg-paper-2/30"}`}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3.5">
          <span className={`grid size-10 shrink-0 place-items-center rounded-lg border border-line ${row.active ? "bg-accent-soft/60 text-accent" : "bg-paper-2 text-muted"}`}>
            <Icon className="size-[18px]" strokeWidth={1.7} aria-hidden />
          </span>
          <div className="min-w-0">
            <button type="button" onClick={() => onEdit(row)} className={`block max-w-full truncate text-left font-semibold hover:text-accent ${row.active ? "text-ink" : "text-muted"}`}>
              {row.name}
            </button>
            <p className="truncate text-[13px] text-muted">
              {row.upcomingCount > 0 && (
                <span className="mr-2 inline-flex items-center gap-1 font-medium text-accent">
                  <CalendarClock className="size-3.5" aria-hidden />
                  {ui.upcoming.replace("{count}", String(row.upcomingCount))}
                </span>
              )}
              {row.description}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4"><CategoryBadge category={row.category} /></td>
      <td className="hidden px-4 py-4 whitespace-nowrap text-muted tabular-nums lg:table-cell">{duration ?? "—"}</td>
      <td className="px-4 py-4 text-right whitespace-nowrap">
        <span className={row.price == null ? "text-[13px] text-muted" : "font-semibold text-ink tabular-nums"}>{formatPrice(row.price, row.priceFrom, t)}</span>
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-center">
          <Switch checked={row.active} pending={row.pending} onChange={(next) => onToggle(row, next)} label={ui.toggleLabel.replace("{name}", row.name)} />
        </div>
      </td>
      <td className="px-5 py-4">
        <RowActions row={row} onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  );
}

function ServiceCard({ row, onEdit, onDelete, onToggle }: RowProps) {
  const { t } = useI18n();
  const ui = t.admin.servicesUi;
  const Icon = serviceIcon(row.icon);
  const duration = formatDuration(row.durationMinutes, t);
  return (
    <li className={`card p-4 ${row.active ? "" : "bg-paper-2/40"}`}>
      <div className="flex items-start gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-lg border border-line ${row.active ? "bg-accent-soft/60 text-accent" : "bg-paper-2 text-muted"}`}>
          <Icon className="size-[18px]" strokeWidth={1.7} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold ${row.active ? "text-ink" : "text-muted"}`}>{row.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <CategoryBadge category={row.category} />
            {duration && <span className="flex items-center gap-1 text-xs text-muted"><Clock className="size-3.5" aria-hidden />{duration}</span>}
          </div>
        </div>
        <Switch checked={row.active} pending={row.pending} onChange={(next) => onToggle(row, next)} label={ui.toggleLabel.replace("{name}", row.name)} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
        <span className={row.price == null ? "text-[13px] text-muted" : "font-semibold text-ink tabular-nums"}>{formatPrice(row.price, row.priceFrom, t)}</span>
        <RowActions row={row} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </li>
  );
}

function RowActions({ row, onEdit, onDelete }: Omit<RowProps, "onToggle">) {
  const { t } = useI18n();
  const ui = t.admin.servicesUi;
  return (
    <div className="flex justify-end gap-1">
      <button type="button" onClick={() => onEdit(row)} disabled={row.pending} className="btn btn-ghost btn-sm !px-2.5" aria-label={`${ui.edit}: ${row.name}`} title={ui.edit}>
        <Pencil className="size-4" aria-hidden />
      </button>
      <button type="button" onClick={() => onDelete(row)} disabled={row.pending} className="btn btn-ghost btn-sm !px-2.5 text-danger hover:!bg-danger-soft" aria-label={`${ui.delete}: ${row.name}`} title={ui.delete}>
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function EmptyBlock({ icon: Icon, title, lead, children }: { icon: typeof Search; title: string; lead: string; children?: React.ReactNode }) {
  const { t } = useI18n();
  const ui = t.admin.servicesUi;
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface/60 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-paper-2 text-muted"><Icon className="size-6" strokeWidth={1.5} aria-hidden /></span>
      <p className="mt-4 font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{lead}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
