import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { EmptyState } from "@/components/admin/ui";

export default async function AdminNotFound() {
  const t = await getT();
  return (
    <EmptyState message={t.notFound.title}>
      <Link href="/admin" className="btn btn-dark">{t.admin.nav.dashboard}</Link>
    </EmptyState>
  );
}
