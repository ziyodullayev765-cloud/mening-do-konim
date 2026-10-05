import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import type { Doctor, WorkingDay } from "@prisma/client";
import { t } from "@/lib/i18n";
import { isPlaceholder, telHref, telegramHref, whatsappHref } from "@/lib/format";
import { ContactForm } from "../ContactForm";
import { Block } from "../Block";

export function Contact({ doctor, schedule }: { doctor: Doctor; schedule: WorkingDay[] }) {
  const ok = (v: string) => v && !isPlaceholder(v);
  const mapQuery = doctor.mapQuery || (ok(doctor.address) ? doctor.address : "");
  const rows = [
    ok(doctor.phone) && { label: t.contact.phone, value: doctor.phone, href: telHref(doctor.phone) },
    ok(doctor.whatsapp) && { label: t.contact.whatsapp, value: doctor.whatsapp, href: whatsappHref(doctor.whatsapp), external: true },
    ok(doctor.telegram) && { label: t.contact.telegram, value: doctor.telegram, href: telegramHref(doctor.telegram), external: true },
    ok(doctor.email) && { label: t.contact.email, value: doctor.email, href: `mailto:${doctor.email}` },
    ok(doctor.address) && {
      label: t.contact.address,
      value: doctor.address,
      href: mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : undefined,
      external: true,
    },
  ].filter(Boolean) as { label: string; value: string; href?: string; external?: boolean }[];

  return (
    <Block id="contact" label={t.contact.eyebrow} title={t.contact.title}>
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <dl className="space-y-5">
            {rows.map((r) => (
              <div key={r.label}>
                <dt className="text-xs text-muted">{r.label}</dt>
                <dd className="mt-0.5 text-[16px] text-ink">
                  {r.href ? (
                    <a href={r.href} {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="hover:text-accent">
                      {r.value}
                    </a>
                  ) : (
                    r.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-10 text-sm font-semibold text-ink">{t.contact.hours}</h3>
          <dl className="mt-3 space-y-1.5 text-[15px]">
            {schedule.map((d) => (
              <div key={d.dayOfWeek} className="flex justify-between gap-4 border-b border-line/70 pb-1.5">
                <dt className="text-muted">{t.weekdays[d.dayOfWeek]}</dt>
                <dd className={`tabular-nums ${d.isOpen ? "text-ink" : "text-muted"}`}>{d.isOpen ? `${d.openTime} – ${d.closeTime}` : t.contact.closed}</dd>
              </div>
            ))}
          </dl>

          <Link href="/book" className="btn btn-primary mt-10">
            <CalendarCheck className="size-4" aria-hidden /> {t.common.bookAppointment}
          </Link>
        </div>
        <ContactForm />
      </div>
    </Block>
  );
}
