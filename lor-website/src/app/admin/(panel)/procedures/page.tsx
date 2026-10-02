import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { ServiceList } from "@/components/admin/ServiceAdmin";

export const metadata: Metadata = { title: t.admin.nav.procedures };

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  return <ServiceList kind="PROCEDURE" saved={(await searchParams).saved === "1"} />;
}
