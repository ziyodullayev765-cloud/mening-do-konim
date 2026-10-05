"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Clock, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { t } from "@/lib/i18n";
import { isPlaceholder, telHref } from "@/lib/format";
import { LogoMark } from "./Logo";

const NAV = [
  { href: "/#directions", label: "Yo'nalishlar" },
  { href: "/#prices", label: t.nav.pricing },
  { href: "/#about", label: t.nav.about },
  { href: "/#reviews", label: "Fikrlar" },
  { href: "/#contact", label: t.nav.contact },
];

type Props = { name: string; phone: string; email: string; address: string; todayHours: string | null; hasReviews: boolean };

export function Header({ name, phone, email, address, todayHours, hasReviews }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ok = (v: string) => Boolean(v) && !isPlaceholder(v);
  const nav = NAV.filter((n) => hasReviews || n.href !== "/#reviews");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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
    <>
      {/* Top utility bar */}
      <div className="hidden border-b border-line bg-paper-2 text-[13px] text-muted md:block">
        <div className="container-x flex h-10 items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-6">
            {ok(email) && (
              <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-accent">
                <Mail className="size-3.5 text-accent" aria-hidden /> {email}
              </a>
            )}
            {ok(address) && (
              <span className="flex min-w-0 items-center gap-1.5 truncate">
                <MapPin className="size-3.5 shrink-0 text-accent" aria-hidden /> <span className="truncate">{address}</span>
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-accent" aria-hidden />
              {todayHours ? `${t.hero.todayHours}: ${todayHours}` : t.hero.closedToday}
            </span>
            <a href="/#faq" className="hover:text-accent">{t.nav.faq}</a>
            {ok(phone) && (
              <a href={telHref(phone)} className="font-semibold text-ink hover:text-accent">{phone}</a>
            )}
          </div>
        </div>
      </div>

      {/* Main sticky header */}
      <header className={`sticky top-0 z-40 border-b bg-white transition-shadow duration-300 ${scrolled || open ? "border-line shadow-[0_6px_20px_-12px_rgb(26_43_76/0.25)]" : "border-transparent"}`}>
        <div className="container-x flex h-[76px] items-center justify-between gap-6">
          <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
            <LogoMark className="size-10 shrink-0" />
            <span className="truncate text-[17px] font-extrabold tracking-tight text-ink">{name}</span>
          </Link>

          <nav aria-label="Asosiy" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="rounded-lg px-3.5 py-2 text-[15px] font-semibold text-ink/80 transition-colors hover:text-accent">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/book" className="btn btn-primary hidden sm:inline-flex">
              {t.common.bookAppointment}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <button
              type="button"
              className="btn btn-ghost lg:hidden"
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
          <div id="mobile-menu" className="fixed inset-x-0 top-[76px] bottom-0 overflow-y-auto border-t border-line bg-white lg:hidden">
            <nav aria-label="Mobil" className="container-x py-6">
              <ul className="divide-y divide-line">
                {nav.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} onClick={() => setOpen(false)} className="block py-4 text-xl font-bold text-ink">{item.label}</a>
                  </li>
                ))}
              </ul>
              <div className="mt-8 grid gap-3">
                <Link href="/book" onClick={() => setOpen(false)} className="btn btn-primary btn-lg w-full">{t.common.bookAppointment}</Link>
                {ok(phone) && (
                  <a href={telHref(phone)} className="btn btn-secondary btn-lg w-full"><Phone className="size-5" aria-hidden /> {phone}</a>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
