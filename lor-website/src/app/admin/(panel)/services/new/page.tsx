import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { ServiceForm } from "@/components/admin/ServiceAdmin";

export const metadata: Metadata = { title: t.admin.nav.services };

export default async function Page() {
  await requireAdmin();
  return <ServiceForm kind="SERVICE" />;
}
