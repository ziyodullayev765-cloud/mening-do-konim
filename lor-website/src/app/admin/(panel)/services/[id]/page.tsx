import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { ServiceForm } from "@/components/admin/ServiceAdmin";

export const metadata: Metadata = { title: t.admin.nav.services };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const service = await db.service.findFirst({ where: { id: (await params).id, kind: "SERVICE" } });
  if (!service) notFound();
  return <ServiceForm kind="SERVICE" service={service} />;
}
