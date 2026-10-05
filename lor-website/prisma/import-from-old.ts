/**
 * TEMPORARY: copies all site data (except admin accounts) from the old Render
 * deployment into this database during the Vercel build. Runs only when
 * OLD_SITE_URL and MIGRATE_EXPORT_TOKEN are set, and only while this database
 * still holds the untouched placeholder profile, so real edits are never wiped.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type Row = Record<string, unknown>;
type Dump = Record<
  "doctor" | "setting" | "workingDays" | "blockedDates" | "services" | "patients" | "appointments" | "testimonials" | "faqs" | "messages" | "media",
  Row[]
>;

const DATES = ["createdAt", "updatedAt", "expiresAt"];
const revive = (rows: Row[]) =>
  rows.map((r) => {
    const out: Row = { ...r };
    for (const k of DATES) if (typeof out[k] === "string") out[k] = new Date(out[k] as string);
    return out;
  });

async function main() {
  const base = process.env.OLD_SITE_URL;
  const token = process.env.MIGRATE_EXPORT_TOKEN;
  if (!base || !token) return console.log("Import: skipped (OLD_SITE_URL / MIGRATE_EXPORT_TOKEN not set)");

  const current = await db.doctor.findUnique({ where: { id: 1 } });
  if (current && !current.fullName.startsWith("[")) return console.log("Import: skipped (profile already filled in)");

  let res: Response | undefined;
  for (let i = 0; i < 5; i++) {
    // The free Render instance may need time to wake up.
    res = await fetch(new URL("/api/migrate-export", base), { headers: { "x-migrate-token": token } }).catch(() => undefined);
    if (res?.ok) break;
    console.log(`Import: export not ready (${res?.status ?? "network error"}), retrying…`);
    await new Promise((r) => setTimeout(r, 20_000));
  }
  if (!res?.ok) throw new Error("Import: could not download the export from the old site");
  const d = (await res.json()) as Dump;

  await db.$transaction(
    async (tx) => {
      await tx.appointment.deleteMany();
      await tx.patient.deleteMany();
      await tx.service.deleteMany();
      await tx.faq.deleteMany();
      await tx.testimonial.deleteMany();
      await tx.blockedDate.deleteMany();
      await tx.workingDay.deleteMany();
      await tx.contactMessage.deleteMany();
      await tx.doctor.deleteMany();
      await tx.setting.deleteMany();
      await tx.media.deleteMany();

      for (const m of revive(d.media)) {
        await tx.media.create({ data: { ...(m as never as object), data: Buffer.from(m.data as string, "base64") } as never });
      }
      if (d.doctor.length) await tx.doctor.createMany({ data: revive(d.doctor) as never });
      if (d.setting.length) await tx.setting.createMany({ data: d.setting as never });
      if (d.workingDays.length) await tx.workingDay.createMany({ data: d.workingDays as never });
      if (d.blockedDates.length) await tx.blockedDate.createMany({ data: d.blockedDates as never });
      if (d.services.length) await tx.service.createMany({ data: revive(d.services) as never });
      if (d.patients.length) await tx.patient.createMany({ data: revive(d.patients) as never });
      if (d.appointments.length) await tx.appointment.createMany({ data: revive(d.appointments) as never });
      if (d.testimonials.length) await tx.testimonial.createMany({ data: revive(d.testimonials) as never });
      if (d.faqs.length) await tx.faq.createMany({ data: revive(d.faqs) as never });
      if (d.messages.length) await tx.contactMessage.createMany({ data: revive(d.messages) as never });
    },
    { timeout: 120_000, maxWait: 20_000 },
  );

  const counts = Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v.length]));
  console.log("Import: done", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
