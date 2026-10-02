import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { Sidebar } from "@/components/admin/Sidebar";
import { Toaster } from "@/components/admin/Toaster";

export const metadata: Metadata = {
  title: { default: t.admin.brand, template: `%s — ${t.admin.brand}` },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [newAppointments, unreadMessages] = await Promise.all([
    db.appointment.count({ where: { status: "NEW" } }),
    db.contactMessage.count({ where: { isRead: false } }),
  ]);
  return (
    <div className="min-h-dvh bg-paper">
      <Sidebar adminName={admin.name} counts={{ newAppointments, unreadMessages }} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
