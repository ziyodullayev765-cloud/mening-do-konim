"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarCheck, Menu, Phone, X } from "lucide-react";
import { t } from "@/lib/i18n";
import { telHref } from "@/lib/format";
import { requestBooking } from "./booking/client";
import { Logo } from "./Logo";

const NAV = [
  { href: "/#services", label: t.nav.services },
  { href: "/#about", label: t.nav.about },
  { href: "/#faq", label: t.nav.faq },
  { href: "/#appointment", label: t.nav.contact },
];

export function Header({ name, title, phone, logoUrl }: { name: string; title: string; phone: string; logoUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`glass pointer-events-auto mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 rounded-full pr-2 pl-3 transition-shadow duration-300 sm:pl-4 ${
          scrolled ? "shadow-lift" : ""
        }`}
      >
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <Logo logoUrl={logoUrl} />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-serif text-[15px] font-semibold text-ink">{name}</span>
            <span className="block truncate text-xs text-muted">{title}</span>
          </span>
        </Link>

        <nav aria-label="Asosiy" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="rounded-full px-4 py-2 text-[14px] font-medium text-text/80 transition-colors hover:bg-white/60 hover:text-ink">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          {phone && (
            <a href={telHref(phone)} className="btn btn-ghost hidden !rounded-full xl:inline-flex" aria-label={t.contact.phone}>
              <Phone className="size-4 text-accent" aria-hidden />
              <span className="text-sm">{phone}</span>
            </a>
          )}
          <button type="button" onClick={() => requestBooking()} className="btn btn-primary hidden sm:inline-flex">
            <CalendarCheck className="size-4" aria-hidden />
            {t.common.bookAppointment}
          </button>
          <button
            type="button"
            className="btn btn-ghost !rounded-full lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="glass pointer-events-auto mx-auto mt-2 max-w-[1200px] rounded-3xl p-3 lg:hidden">
          <nav aria-label="Mobil">
            <ul>
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3.5 font-serif text-lg font-medium text-ink hover:bg-white/60">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-2 grid gap-2 p-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  requestBooking();
                }}
                className="btn btn-primary btn-lg w-full"
              >
                <CalendarCheck className="size-5" aria-hidden /> {t.common.bookAppointment}
              </button>
              {phone && (
                <a href={telHref(phone)} className="btn btn-secondary btn-lg w-full">
                  <Phone className="size-5" aria-hidden /> {phone}
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
