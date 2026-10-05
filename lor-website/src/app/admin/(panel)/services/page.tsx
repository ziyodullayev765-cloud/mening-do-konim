import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { clinicNow, getSettings } from "@/lib/slots";
import { SERVICE_CATEGORIES, type ServiceCategoryKey } from "@/lib/schemas/service";
import { ServicesManager } from "@/components/admin/services/ServicesManager";
import { SORT_KEYS, type Filters, type ServiceRow, type SortKey } from "@/components/admin/services/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.servicesUi.title };
}

type Search = { q?: string; category?: string; status?: string; sort?: string };

/** Untrusted URL params -> safe initial filters. */
function parseFilters(sp: Search): Filters {
  return {
    q: (sp.q ?? "").slice(0, 100),
    category: SERVICE_CATEGORIES.includes(sp.category as ServiceCategoryKey) ? (sp.category as ServiceCategoryKey) : "ALL",
    status: sp.status === "active" || sp.status === "inactive" ? sp.status : "all",
    sort: SORT_KEYS.includes(sp.sort as SortKey) ? (sp.sort as SortKey) : "manual",
  };
}

export default async function ServicesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const t = await getT();
  await requireAdmin();
  const [sp, settings] = await Promise.all([searchParams, getSettings()]);
  const today = clinicNow(settings.timezone).date;

  const [services, upcoming] = await Promise.all([
    db.service.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    db.appointment.groupBy({
      by: ["serviceId"],
      where: { date: { gte: today }, status: { in: ["NEW", "CONFIRMED", "RESCHEDULED"] }, serviceId: { not: null } },
      _count: { _all: true },
    }),
  ]);
  const upcomingById = new Map(upcoming.map((u) => [u.serviceId, u._count._all]));

  const rows: ServiceRow[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    description: s.description,
    price: s.price,
    priceFrom: s.priceFrom,
    durationMinutes: s.durationMinutes,
    icon: s.icon,
    imageUrl: s.imageUrl,
    indication: s.indication,
    recovery: s.recovery,
    nameRu: s.nameRu,
    descriptionRu: s.descriptionRu,
    indicationRu: s.indicationRu,
    recoveryRu: s.recoveryRu,
    showInPricing: s.showInPricing,
    active: s.active,
    sortOrder: s.sortOrder,
    createdAt: s.createdAt.toISOString(),
    upcomingCount: upcomingById.get(s.id) ?? 0,
  }));

  return <ServicesManager services={rows} initialFilters={parseFilters(sp)} />;
}
