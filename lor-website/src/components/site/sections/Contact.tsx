import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import type { Doctor, WorkingDay } from "@prisma/client";
import { t } from "@/lib/i18n";
import { isPlaceholder, telHref, telegramHref, whatsappHref } from "@/lib/format";
import { ContactForm } from "../ContactForm";
import { Block } from "../Block";
import { Reveal } from "../Reveal";

export function Contact({ doctor, schedule }: { doctor: Doctor; schedule: WorkingDay[] }) {
  const ok = (v: string) => Boolean(v) && !isPlaceholder(v);
  const mapQuery = doctor.mapQuery || (ok(doctor.address) ? doctor.address : "");
  const rows = [
    ok(doctor.phone) && { icon: Phone, label: t.contact.phone, value: doctor.phone, href: telHref(doctor.phone) },
    ok(doctor.whatsapp) && { icon: MessageCircle, label: t.contact.whatsapp, value: doctor.whatsapp, href: whatsappHref(doctor.whatsapp), external: true },
    ok(doctor.telegram) && { icon: Send, label: t.contact.telegram, value: doctor.telegram, href: telegramHref(doctor.telegram), external: true },
    ok(doctor.email) && { icon: Mail, label: t.contact.email, value: doctor.email, href: `mailto:${doctor.email}` },
    ok(doctor.address) && {
      icon: MapPin,
      label: t.contact.address,
      value: doctor.address,
      href: mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : undefined,
      external: true,
    },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string; external?: boolean }[];

  return (
    <Block id="contact" label={t.contact.eyebrow} title={t.contact.title}>
      <div className="grid gap-6 lg:grid-cols-12">
        <Reveal className="card p-6 sm:p-8 lg:col-span-5">
          <ul className="space-y-5">
            {rows.map((r) => (
              <li key={r.label} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent"><r.icon className="size-5" aria-hidden /></span>
                <div className="min-w-0">
                  <p className="text-xs text-muted">{r.label}</p>
                  {r.href ? (
                    <a href={r.href} {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="font-semibold break-words text-ink hover:text-accent">{r.value}</a>
                  ) : (
                    <p className="font-semibold text-ink">{r.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 border-t border-line pt-6">
            <p className="flex items-center gap-2 font-bold text-ink"><Clock className="size-5 text-accent" aria-hidden />{t.contact.hours}</p>
            <dl className="mt-3 space-y-1.5 text-[15px]">
              {schedule.map((d) => (
                <div key={d.dayOfWeek} className="flex justify-between gap-4">
                  <dt className="text-muted">{t.weekdays[d.dayOfWeek]}</dt>
                  <dd className={`tabular-nums ${d.isOpen ? "font-semibold text-ink" : "text-muted"}`}>{d.isOpen ? `${d.openTime} – ${d.closeTime}` : t.contact.closed}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Link href="/book" className="btn btn-primary mt-8 w-full">
            {t.common.bookAppointment} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Reveal>
        <Reveal delay={80} className="lg:col-span-7">
          <ContactForm />
        </Reveal>
      </div>
    </Block>
  );
}
