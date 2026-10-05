"use server";

import { autoRu } from "@/lib/i18n/content-ru";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/db";
import { t as uz } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { failure, success, type ActionState } from "@/lib/action";
import { formatDate, normalizePhone } from "@/lib/format";
import { esc, notifyTelegram } from "@/lib/telegram";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getAvailableSlots, getSettings } from "@/lib/slots";
import { bookingSchemaFor, contactSchemaFor, fieldErrors } from "@/lib/validation";

export type BookingResult = ActionState & {
  booking?: { service: string; date: string; time: string; name: string };
  /** Set when the chosen slot is no longer free so the client can go back a step. */
  slotTaken?: boolean;
};

export async function createBooking(input: unknown): Promise<BookingResult> {
  const t = await getT();
  const ip = await clientIp();
  if (!rateLimit(`booking:${ip}`, 6, 15 * 60 * 1000).ok) return failure(t.common.tooManyRequests);

  const parsed = bookingSchemaFor(t).safeParse(input);
  if (!parsed.success) return failure(t.common.invalidForm, fieldErrors(parsed.error));
  const data = parsed.data;

  try {
    const settings = await getSettings();
    if (!settings.bookingEnabled) return failure(t.booking.unavailable);

    const service = data.serviceId
      ? await db.service.findFirst({ where: { id: data.serviceId, active: true } })
      : null;
    if (data.serviceId && !service) return failure(t.booking.errors.service, { serviceId: [t.booking.errors.service] });
    // Stored in Uzbek (admin language); the visitor sees their own language.
    const serviceName = service?.name ?? uz.booking.noServiceName;
    const shownServiceName = service ? (t.meta.locale === "ru" ? service.nameRu.trim() || autoRu(service.name) : service.name) : t.booking.noServiceName;

    const slots = await getAvailableSlots(data.date);
    if (!slots.includes(data.time)) return { ...failure(t.booking.slotTaken), slotTaken: true };

    const phone = normalizePhone(data.phone);
    const appointment = await db.$transaction(async (tx) => {
      const patient = await tx.patient.upsert({
        where: { phone },
        create: { phone, fullName: data.fullName, email: data.email || null },
        update: { fullName: data.fullName, ...(data.email ? { email: data.email } : {}) },
      });
      return tx.appointment.create({
        data: {
          patientId: patient.id,
          serviceId: service?.id ?? null,
          serviceName,
          date: data.date,
          time: data.time,
          note: data.note,
        },
      });
    });

    revalidatePath("/admin", "layout");

    // Telegram alert for the doctor — sent after the response so the patient never waits on it.
    const site = process.env.SITE_URL;
    after(() =>
      notifyTelegram(
        [
          "🆕 <b>Yangi qabul</b>",
          "",
          `👤 <b>${esc(data.fullName)}</b>`,
          `📞 ${esc(phone)}`,
          data.email ? `✉️ ${esc(data.email)}` : null,
          `🩺 ${esc(serviceName)}`,
          `📅 ${esc(formatDate(data.date, true, uz))}, ⏰ <b>${esc(data.time)}</b>`,
          data.note ? `💬 ${esc(data.note)}` : null,
          site ? `\n<a href="${site}/admin/appointments/${appointment.id}">Admin panelda ochish</a>` : null,
        ]
          .filter((x) => x !== null)
          .join("\n"),
      ),
    );

    return {
      ...success(),
      booking: { service: shownServiceName, date: data.date, time: data.time, name: data.fullName },
    };
  } catch (e) {
    // The partial unique index on (date, time) guarantees no double booking under races.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ...failure(t.booking.slotTaken), slotTaken: true };
    }
    console.error("createBooking failed", e);
    return failure(t.common.serverError);
  }
}

export async function sendContactMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  // Honeypot: silently accept bot submissions without storing them.
  if (formData.get("website")) return success(t.contact.sent);

  const ip = await clientIp();
  if (!rateLimit(`contact:${ip}`, 5, 15 * 60 * 1000).ok) return failure(t.common.tooManyRequests);

  const parsed = contactSchemaFor(t).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure(t.common.invalidForm, fieldErrors(parsed.error));

  try {
    const phone = normalizePhone(parsed.data.phone);
    await db.contactMessage.create({
      data: {
        name: parsed.data.name,
        phone,
        email: parsed.data.email || null,
        message: parsed.data.message,
      },
    });
    const { name, email, message } = parsed.data;
    after(() =>
      notifyTelegram(
        [
          "✉️ <b>Saytdan yangi xabar</b>",
          "",
          `👤 <b>${esc(name)}</b>`,
          `📞 ${esc(phone)}`,
          email ? `✉️ ${esc(email)}` : null,
          `💬 ${esc(message)}`,
        ]
          .filter((x) => x !== null)
          .join("\n"),
      ),
    );
    return success(t.contact.sent);
  } catch (e) {
    console.error("sendContactMessage failed", e);
    return failure(t.common.serverError);
  }
}
