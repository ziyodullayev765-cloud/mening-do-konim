/**
 * Initial data. Safe to re-run: existing records are never overwritten.
 *
 * Everything in [SQUARE BRACKETS] is a placeholder to be replaced from the
 * admin panel (/admin/profile). Services and prices are DEMO content that
 * should be reviewed and edited by the clinic before launch. No testimonials,
 * statistics or achievements are invented.
 */
import bcrypt from "bcryptjs";
import { PrismaClient, type Prisma } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin account.");
  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters.");

  if (!(await db.admin.findUnique({ where: { email } }))) {
    await db.admin.create({ data: { email, name: "Administrator", passwordHash: await bcrypt.hash(password, 12) } });
    console.log(`Admin created: ${email}`);
  }

  if (!(await db.doctor.findUnique({ where: { id: 1 } }))) {
    await db.doctor.create({
      data: {
        id: 1,
        fullName: "[Shifokor F.I.Sh.]",
        title: "LOR shifokori (otorinolaringolog)",
        shortDescription: "[Shifokor haqida qisqa professional tavsif — admin paneldan tahrirlang.]",
        biography: "[Shifokorning biografiyasi. Har bir xatboshi yangi qatordan yoziladi. Admin panel → Shifokor profili bo'limida tahrirlang.]",
        specializations: "Quloq kasalliklari\nBurun va burun yondosh bo'shliqlari kasalliklari\nTomoq va hiqildoq kasalliklari\nBolalar LOR kasalliklari",
        education: "[Oliy ta'lim muassasasi, yil]\n[Klinik ordinatura, yil]",
        training: "[Malaka oshirish kursi, yil]",
        professionalHistory: "[Yillar] | [Lavozim, muassasa]",
        certifications: "[Sertifikat nomi, yil]",
        memberships: "",
        clinicName: "[Klinika nomi]",
        city: "[Shahar]",
        country: "O'zbekiston",
        address: "[To'liq manzil]",
        phone: "[+998 XX XXX XX XX]",
        whatsapp: "",
        telegram: "",
        email: "",
      },
    });
    console.log("Doctor profile placeholder created");
  }

  if ((await db.workingDay.count()) === 0) {
    await db.workingDay.createMany({
      data: [
        { dayOfWeek: 0, isOpen: false, openTime: "09:00", closeTime: "14:00" },
        ...[1, 2, 3, 4, 5].map((d) => ({ dayOfWeek: d, isOpen: true, openTime: "09:00", closeTime: "18:00" })),
        { dayOfWeek: 6, isOpen: true, openTime: "09:00", closeTime: "14:00" },
      ],
    });
    console.log("Working schedule created");
  }

  if (!(await db.setting.findUnique({ where: { id: 1 } }))) {
    await db.setting.create({ data: { id: 1 } });
  }

  if ((await db.service.count()) === 0) {
    const services: Prisma.ServiceCreateManyInput[] = [
      { kind: "SERVICE", category: "CONSULTATION", name: "LOR konsultatsiyasi", description: "Shikoyatlarni o'rganish, quloq, burun va tomoqni ko'rikdan o'tkazish, davolash rejasini tuzish.", price: 250000, durationMinutes: 30, icon: "stethoscope", sortOrder: 1 },
      { kind: "SERVICE", category: "DIAGNOSTICS", name: "Endoskopik tekshiruv", description: "Burun bo'shlig'i va hiqildoqni endoskop yordamida batafsil ko'rish.", price: 300000, durationMinutes: 30, icon: "microscope", sortOrder: 2 },
      { kind: "SERVICE", category: "DIAGNOSTICS", name: "Quloq tekshiruvi", description: "Tashqi va o'rta quloqni otoskopik ko'rikdan o'tkazish.", durationMinutes: 20, icon: "ear", sortOrder: 3 },
      { kind: "SERVICE", category: "DIAGNOSTICS", name: "Burun tekshiruvi", description: "Burun bo'shlig'i va nafas olish holatini baholash.", durationMinutes: 20, icon: "wind", sortOrder: 4 },
      { kind: "SERVICE", category: "DIAGNOSTICS", name: "Tomoq tekshiruvi", description: "Tomoq, bodomcha bezlar va hiqildoq holatini baholash.", durationMinutes: 20, icon: "mic", sortOrder: 5 },
      { kind: "SERVICE", category: "CONSULTATION", name: "Bolalar LOR qabuli", description: "Bolalar uchun moslashtirilgan LOR ko'rigi va maslahat.", durationMinutes: 30, icon: "baby", sortOrder: 6 },
      { kind: "PROCEDURE", category: "TREATMENT", name: "LOR muolajasi", description: "[Muolaja tavsifi — admin paneldan tahrirlang.]", price: 2500000, priceFrom: true, icon: "scissors", sortOrder: 1 },
    ];
    await db.service.createMany({ data: services });
    console.log("Demo services created (review before launch)");
  }

  if ((await db.faq.count()) === 0) {
    await db.faq.createMany({
      data: [
        { sortOrder: 1, question: "Qabulga qanday yozilaman?", answer: "Saytdagi \"Qabulga yozilish\" tugmasini bosing, xizmat, sana va vaqtni tanlang hamda ma'lumotlaringizni kiriting. Klinika administratori qabulni tasdiqlash uchun siz bilan bog'lanadi." },
        { sortOrder: 2, question: "Qabul vaqtini o'zgartirish yoki bekor qilish mumkinmi?", answer: "Ha. Buning uchun klinikaga telefon orqali murojaat qiling." },
        { sortOrder: 3, question: "Qabulga nimalarni olib kelish kerak?", answer: "Shaxsingizni tasdiqlovchi hujjat va avvalgi tekshiruv natijalari (agar mavjud bo'lsa)." },
        { sortOrder: 4, question: "Narxlar qanday aniqlanadi?", answer: "Saytdagi narxlar asosiy xizmatlar uchun. Muolaja narxi shifokor ko'rigidan so'ng aniqlashtiriladi." },
      ],
    });
    console.log("FAQ created");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
