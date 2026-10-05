/**
 * TEMPORARY: one-off data export used to move the site from Render to Vercel.
 * Disabled (404) unless MIGRATE_EXPORT_TOKEN is set; the caller must send the
 * same value in the x-migrate-token header. Remove after the move.
 */
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function tokenOk(given: string | null) {
  const expected = process.env.MIGRATE_EXPORT_TOKEN;
  if (!expected || expected.length < 32 || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!tokenOk(req.headers.get("x-migrate-token"))) return new Response("Not found", { status: 404 });

  const [doctor, setting, workingDays, blockedDates, services, patients, appointments, testimonials, faqs, messages, media] =
    await Promise.all([
      db.doctor.findMany(),
      db.setting.findMany(),
      db.workingDay.findMany(),
      db.blockedDate.findMany(),
      db.service.findMany(),
      db.patient.findMany(),
      db.appointment.findMany(),
      db.testimonial.findMany(),
      db.faq.findMany(),
      db.contactMessage.findMany(),
      db.media.findMany(),
    ]);

  const body = JSON.stringify({
    doctor,
    setting,
    workingDays,
    blockedDates,
    services,
    patients,
    appointments,
    testimonials,
    faqs,
    messages,
    media: media.map((m) => ({ ...m, data: Buffer.from(m.data).toString("base64") })),
  });
  return new Response(body, { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
