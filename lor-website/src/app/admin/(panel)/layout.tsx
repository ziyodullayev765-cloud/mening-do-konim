import type { Metadata } from "next";
import { after } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { ensureWebhook } from "@/lib/telegram";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/slots";
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
  // Keep the Telegram bot pointed at this site (no-op once set; outside the request path).
  after(() => ensureWebhook());
  const [newAppointments, unreadMessages, settings] = await Promise.all([
    db.appointment.count({ where: { status: "NEW" } }),
    db.contactMessage.count({ where: { isRead: false } }),
    getSettings(),
  ]);
  const bg = settings.adminBackgroundUrl;
  return (
    <I18nProvider locale={locale}>
    <div className="admin-glass relative isolate min-h-dvh bg-paper">
      {/* Soft drifting colour behind the frosted "liquid glass" panels */}
      <div aria-hidden className="admin-aurora pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {bg && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bg} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="admin-bg-veil absolute inset-0" />
          </>
        )}
      </div>
      <Sidebar adminName={admin.name} counts={{ newAppointments, unreadMessages }} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</main>
      </div>
      <Toaster />
    </div>
    </I18nProvider>
  );
}
