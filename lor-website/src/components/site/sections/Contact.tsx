import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import type { Doctor, WorkingDay } from "@prisma/client";
import { getT } from "@/lib/i18n/server";
import { isPlaceholder, telHref, telegramHref, whatsappHref } from "@/lib/format";
import { ContactForm } from "../ContactForm";
import { Block } from "../Block";
import { Reveal } from "../Reveal";
import { CaduceusMark } from "../EntBackdrop";

export async function Contact({ doctor, schedule }: { doctor: Doctor; schedule: WorkingDay[] }) {
  const t = await getT();
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
    <Block id="contact" label={t.contact.eyebrow} title={t.contact.title} panel={{}}>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
        <Reveal className="glass-card relative isolate overflow-hidden p-4 sm:p-6 lg:col-span-5">
          <CaduceusMark className="absolute left-1/2 top-1/2 -z-10 h-[80%] -translate-x-1/2 -translate-y-1/2 text-[#1e9db2] opacity-[0.09]" />
          <ul className="space-y-3.5 sm:space-y-5">
            {rows.map((r) => (
              <li key={r.label} className="flex gap-3 sm:gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg sm:size-11 sm:rounded-xl bg-accent-soft text-accent"><r.icon className="size-4 sm:size-5" aria-hidden /></span>
                <div className="min-w-0">
                  <p className="text-xs text-muted">{r.label}</p>
                  {r.href ? (
                    <a href={r.href} {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="text-[15px] font-semibold break-words text-ink hover:text-accent sm:text-base">{r.value}</a>
                  ) : (
                    <p className="text-[15px] font-semibold text-ink sm:text-base">{r.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-line pt-4 sm:mt-8 sm:pt-6">
            <p className="flex items-center gap-2 font-bold text-ink"><Clock className="size-5 text-accent" aria-hidden />{t.contact.hours}</p>
            <dl className="mt-2.5 space-y-1 text-sm sm:mt-3 sm:space-y-1.5 sm:text-[15px]">
              {schedule.map((d) => (
                <div key={d.dayOfWeek} className="flex justify-between gap-4">
                  <dt className="text-muted">{t.weekdays[d.dayOfWeek]}</dt>
                  <dd className={`tabular-nums ${d.isOpen ? "font-semibold text-ink" : "text-muted"}`}>{d.isOpen ? `${d.openTime} – ${d.closeTime}` : t.contact.closed}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Link href="/book" className="btn btn-primary mt-5 w-full sm:mt-8">
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
