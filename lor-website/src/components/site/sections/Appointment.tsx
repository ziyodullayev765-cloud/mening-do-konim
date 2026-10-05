import Image from "next/image";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import type { Doctor, WorkingDay } from "@prisma/client";
import { t } from "@/lib/i18n";
import { telHref, telegramHref, whatsappHref } from "@/lib/format";
import { AppointmentForm } from "../booking/AppointmentForm";
import { APPOINTMENT_ID } from "../booking/client-ids";
import type { BookableService } from "../booking/types";
import { Reveal } from "../Reveal";

/** Appointment form + contact info, laid out like the reference design. */
export function Appointment({
  doctor,
  schedule,
  services,
  initialServiceId,
  initialDate,
}: {
  doctor: Doctor;
  schedule: WorkingDay[];
  services: BookableService[];
  initialServiceId?: string;
  initialDate?: string;
}) {
  const contacts = [
    doctor.phone && { icon: Phone, label: t.contact.phone, value: doctor.phone, href: telHref(doctor.phone) },
    doctor.whatsapp && { icon: MessageCircle, label: t.contact.whatsapp, value: doctor.whatsapp, href: whatsappHref(doctor.whatsapp), external: true },
    doctor.telegram && { icon: Send, label: t.contact.telegram, value: doctor.telegram, href: telegramHref(doctor.telegram), external: true },
    doctor.email && { icon: Mail, label: t.contact.email, value: doctor.email, href: `mailto:${doctor.email}` },
    doctor.address && {
      icon: MapPin,
      label: t.contact.address,
      value: doctor.address,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doctor.mapQuery || doctor.address)}`,
      external: true,
    },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href: string; external?: boolean }[];

  const contactPhoto = doctor.contactPhotoUrl;

  return (
    <section id={APPOINTMENT_ID} aria-labelledby="appointment-title" className="section scroll-mt-24">
      <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-14">
        <Reveal className="lg:col-span-7">
          <p className="eyebrow">{t.home.appointmentEyebrow}</p>
          <h2 id="appointment-title" className="h-section mt-3">{t.home.appointmentTitle}</h2>
          <p className="mt-3 max-w-xl text-muted">{t.home.appointmentLead}</p>
          <div className="mt-8 rounded-[28px] border border-white bg-white p-5 shadow-soft sm:p-8">
            <AppointmentForm services={services} initialServiceId={initialServiceId} initialDate={initialDate} />
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-5">
          <h2 className="h-section text-[1.75rem]">{t.home.contactTitle}</h2>
          {contactPhoto && (
            <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-[28px] bg-gradient-to-br from-[#e3efff] to-[#c4dcfa] shadow-soft">
              <Image src={contactPhoto} alt={doctor.clinicName || doctor.fullName} fill sizes="(min-width: 1024px) 35vw, 100vw" className="object-cover" />
            </div>
          )}
          <ul className="mt-6 space-y-1">
            {contacts.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-start gap-4 rounded-2xl p-3 transition-colors hover:bg-white"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                    <c.icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span className="block font-semibold text-ink">{c.label}</span>
                    <span className="block text-[15px] break-words text-muted">{c.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-3xl border border-white bg-white p-5 shadow-soft">
            <p className="flex items-center gap-2 font-semibold text-ink">
              <Clock className="size-5 text-accent" aria-hidden /> {t.contact.hours}
            </p>
            <dl className="mt-3 space-y-1.5 text-[14.5px]">
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
        </Reveal>
      </div>
    </section>
  );
}
