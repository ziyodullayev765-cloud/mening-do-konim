"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgeDollarSign, CalendarClock, CalendarDays, CircleHelp, ExternalLink, LayoutDashboard,
  LogOut, Menu, Quote, Settings, Stethoscope, UserRound, Users, X,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { logout } from "@/app/admin/actions/auth";

const NAV = [
  { href: "/admin", label: t.admin.nav.dashboard, icon: LayoutDashboard, exact: true },
  { href: "/admin/appointments", label: t.admin.nav.appointments, icon: CalendarDays, badge: "newAppointments" },
  { href: "/admin/patients", label: t.admin.nav.patients, icon: Users },
  { href: "/admin/services", label: t.admin.nav.services, icon: Stethoscope },
  { href: "/admin/prices", label: t.admin.nav.prices, icon: BadgeDollarSign },
  { href: "/admin/profile", label: t.admin.nav.profile, icon: UserRound },
  { href: "/admin/schedule", label: t.admin.nav.schedule, icon: CalendarClock },
  { href: "/admin/testimonials", label: t.admin.nav.testimonials, icon: Quote },
  { href: "/admin/faq", label: t.admin.nav.faq, icon: CircleHelp },
  { href: "/admin/settings", label: t.admin.nav.settings, icon: Settings },
] as const;

type Counts = { newAppointments: number };

export function Sidebar({ adminName, counts }: { adminName: string; counts: Counts }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <span className="grid size-8 place-items-center rounded-md bg-accent font-serif text-sm text-white">Dr</span>
        <span className="text-sm font-semibold text-white">{t.admin.brand}</span>
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const count = "badge" in item ? counts[item.badge] : 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors ${
                  active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="size-[18px]" strokeWidth={1.7} aria-hidden />
                <span className="flex-1">{item.label}</span>
                {count > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white tabular-nums">{count}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] text-white/60 hover:bg-white/5 hover:text-white">
          <ExternalLink className="size-[18px]" strokeWidth={1.7} aria-hidden /> {t.admin.nav.viewSite}
        </Link>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[14px] text-white/60 hover:bg-white/5 hover:text-white">
            <LogOut className="size-[18px]" strokeWidth={1.7} aria-hidden />
            <span className="flex-1">{t.admin.nav.logout}</span>
            <span className="max-w-24 truncate text-xs text-white/35">{adminName}</span>
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-ink px-4 lg:hidden">
        <span className="text-sm font-semibold text-white">{t.admin.brand}</span>
        <button type="button" onClick={() => setOpen((v) => !v)} className="p-2 text-white" aria-label={open ? t.nav.closeMenu : t.nav.openMenu} aria-expanded={open}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>
      {open && <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-ink transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {nav}
      </aside>
    </>
  );
}
