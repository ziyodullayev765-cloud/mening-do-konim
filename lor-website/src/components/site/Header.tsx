"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarCheck, Menu, Phone, X } from "lucide-react";
import { t } from "@/lib/i18n";

const NAV = [
  { href: "/#top", label: t.nav.home },
  { href: "/#about", label: t.nav.about },
  { href: "/#services", label: t.nav.services },
  { href: "/#procedures", label: t.nav.procedures },
  { href: "/#pricing", label: t.nav.pricing },
  { href: "/#experience", label: t.nav.experience },
  { href: "/#faq", label: t.nav.faq },
  { href: "/#contact", label: t.nav.contact },
];

export function Header({ name, title, phone }: { name: string; title: string; phone: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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

  const initials = name
    .replace(/[[\]]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300 ${
        scrolled || open
          ? "border-b border-line bg-paper/90 shadow-[0_1px_0_rgb(14_26_43/0.02)] backdrop-blur-md"
          : "border-b border-transparent bg-paper/0"
      }`}
    >
      <div className="container-x flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="group flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/15 bg-ink font-serif text-[15px] text-paper">
            {initials || "Dr"}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-semibold text-ink">{name}</span>
            <span className="block truncate text-xs text-muted">{title}</span>
          </span>
        </Link>

        <nav aria-label="Asosiy" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {NAV.slice(1).map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-md px-3 py-2 text-[14px] font-medium text-text/80 transition-colors hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {phone && (
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="btn btn-ghost hidden lg:inline-flex" aria-label={t.contact.phone}>
              <Phone className="size-4" aria-hidden />
              <span className="hidden 2xl:inline">{phone}</span>
            </a>
          )}
          <Link href="/book" className="btn btn-primary hidden sm:inline-flex">
            <CalendarCheck className="size-4" aria-hidden />
            {t.common.bookAppointment}
          </Link>
          <button
            type="button"
            className="btn btn-ghost xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="xl:hidden fixed inset-x-0 top-[72px] bottom-0 overflow-y-auto border-t border-line bg-paper"
      >
        <nav aria-label="Mobil" className="container-x py-6">
          <ul className="divide-y divide-line">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-4 font-serif text-2xl text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-3">
            <Link href="/book" onClick={() => setOpen(false)} className="btn btn-primary btn-lg w-full">
              <CalendarCheck className="size-5" aria-hidden />
              {t.common.bookAppointment}
            </Link>
            {phone && (
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="btn btn-secondary btn-lg w-full">
                <Phone className="size-5" aria-hidden />
                {phone}
              </a>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
