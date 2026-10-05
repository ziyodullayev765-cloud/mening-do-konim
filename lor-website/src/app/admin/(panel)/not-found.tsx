import Link from "next/link";
import { t } from "@/lib/i18n";
import { EmptyState } from "@/components/admin/ui";

export default function AdminNotFound() {
  return (
    <EmptyState message={t.notFound.title}>
      <Link href="/admin" className="btn btn-dark">{t.admin.nav.dashboard}</Link>
    </EmptyState>
  );
}
