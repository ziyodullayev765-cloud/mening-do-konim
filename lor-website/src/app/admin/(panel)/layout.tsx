import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLocale, getT } from "@/lib/i18n/server";
import { I18nProvider } from "@/components/site/I18nProvider";
import { Sidebar } from "@/components/admin/Sidebar";
import { Toaster } from "@/components/admin/Toaster";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: { default: t.admin.brand, template: `%s — ${t.admin.brand}` },
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const admin = await requireAdmin();
  const [newAppointments, unreadMessages] = await Promise.all([
    db.appointment.count({ where: { status: "NEW" } }),
    db.contactMessage.count({ where: { isRead: false } }),
  ]);
  return (
    <I18nProvider locale={locale}>
    <div className="min-h-dvh bg-paper">
      <Sidebar adminName={admin.name} counts={{ newAppointments, unreadMessages }} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</main>
      </div>
      <Toaster />
    </div>
    </I18nProvider>
  );
}
