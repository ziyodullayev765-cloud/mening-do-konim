import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import type { Doctor, WorkingDay } from "@prisma/client";
import { t } from "@/lib/i18n";
import { telHref, telegramHref, whatsappHref } from "@/lib/format";
import { ContactForm } from "../ContactForm";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";

export function Contact({ doctor, schedule }: { doctor: Doctor; schedule: WorkingDay[] }) {
  const channels = [
    doctor.phone && { icon: Phone, label: t.contact.phone, value: doctor.phone, href: telHref(doctor.phone) },
    doctor.whatsapp && { icon: MessageCircle, label: t.contact.whatsapp, value: doctor.whatsapp, href: whatsappHref(doctor.whatsapp), external: true },
    doctor.telegram && { icon: Send, label: t.contact.telegram, value: doctor.telegram, href: telegramHref(doctor.telegram), external: true },
    doctor.email && { icon: Mail, label: t.contact.email, value: doctor.email, href: `mailto:${doctor.email}` },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href: string; external?: boolean }[];

  const mapQuery = doctor.mapQuery || doctor.address;

  return (
    <section id="contact" aria-labelledby="contact-title" className="section bg-paper-2/60">
      <div className="container-x">
        <SectionHeading id="contact-title" eyebrow={t.contact.eyebrow} title={t.contact.title} />

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Reveal>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 [&>li:last-child:nth-child(odd)]:col-span-full">
                {channels.map((c) => (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="card group flex items-center gap-4 p-5 transition-[border-color,box-shadow] hover:border-accent/40 hover:shadow-lift"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                        <c.icon className="size-5" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted">{c.label}</span>
                        <span className="mt-0.5 block truncate font-semibold text-ink">{c.value}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={60} className="card p-6">
              {doctor.address && (
                <div className="flex gap-4">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.contact.address}</p>
                    <p className="mt-1 font-medium text-ink">{doctor.address}</p>
                  </div>
                </div>
              )}
              <div className={`flex gap-4 ${doctor.address ? "mt-6 border-t border-line pt-6" : ""}`}>
                <Clock className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.contact.hours}</p>
                  <dl className="mt-2 space-y-1.5 text-[15px]">
                    {schedule.map((d) => (
                      <div key={d.dayOfWeek} className="flex justify-between gap-4">
                        <dt className="text-muted">{t.weekdays[d.dayOfWeek]}</dt>
                        <dd className={`tabular-nums ${d.isOpen ? "font-medium text-ink" : "text-muted"}`}>
                          {d.isOpen ? `${d.openTime} – ${d.closeTime}` : t.contact.closed}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="space-y-6 lg:col-span-7">
            {mapQuery && (
              <Reveal className="card overflow-hidden">
                <iframe
                  title={t.contact.mapTitle}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                  className="block h-72 w-full border-0 grayscale-[35%] lg:h-80"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Reveal>
            )}
            <Reveal delay={80}>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
