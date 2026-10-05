# LOR shifokori sayti — onlayn yozilish + admin panel

Premium ENT/LOR shifokori uchun to'liq full-stack sayt: ommaviy sayt, onlayn qabulga yozilish va xavfsiz boshqaruv paneli.

**Stack:** Next.js 16 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 6 · PostgreSQL · Zod · Lucide · bcrypt

## Imkoniyatlar

**Ommaviy sayt** (`/`) — Hero, raqamlar (faqat kiritilgan haqiqiy qiymatlar), shifokor haqida, xizmatlar, muolajalar, narxlar, tajriba, malaka, bemorlar fikri (faqat qo'shilgan bo'lsa), FAQ (accordion), aloqa (xarita + forma), yakuniy CTA, footer, mobil "Qabulga yozilish" paneli. SEO: metadata, Open Graph, `sitemap.xml`, `robots.txt`, schema.org (Physician, FAQPage — faqat to'ldirilgan maydonlardan).

**Onlayn yozilish** (`/book`) — Xizmat → Sana → Vaqt → Ma'lumotlar → Tasdiq. Faqat ish jadvalidagi bo'sh vaqtlar ko'rsatiladi; ishlamaydigan kunlar, eng kam ogohlantirish vaqti va yozilish oynasi hisobga olinadi. Ikki marta band qilish ma'lumotlar bazasi darajasida (partial unique index) bloklanadi.

**Admin panel** (`/admin`) — Bosh panel (haqiqiy statistika), qabullar (qidiruv, sana/xizmat/holat filtri, tasdiqlash, bekor qilish, ko'chirish, yakunlash, ichki izoh), bemorlar (tarix), xizmatlar (kategoriya: konsultatsiya/diagnostika/muolaja/operatsiya; qidiruv, filtr, saralash, modal orqali qo'shish/tahrirlash, optimistik yoqish/o'chirish), narxlar (tez tahrirlash), shifokor profili, ish jadvali + ishlamaydigan kunlar, fikrlar, FAQ (tartiblash), xabarlar, sozlamalar (yozilish, SEO, parol).

**Xavfsizlik** — bcrypt parol xeshlari; serverda saqlanadigan sessiyalar (cookie'da tasodifiy token, bazada faqat SHA-256 xeshi; `httpOnly`, `sameSite=lax`, productionda `secure`); har bir admin sahifa va action'da `requireAdmin()`; Zod bilan server tomonda validatsiya; Prisma (SQL injection'dan himoya); login/yozilish/aloqa uchun rate limiting; Server Actions'ning o'rnatilgan Origin tekshiruvi (CSRF); xavfsizlik sarlavhalari; barcha sirlar faqat muhit o'zgaruvchilarida.

## Ishga tushirish (lokal)

```bash
cp .env.example .env          # DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, SITE_URL ni to'ldiring
npm install
npx prisma migrate deploy     # jadvallarni yaratadi
npm run db:seed               # admin hisobi + boshlang'ich ma'lumotlar
npm run dev                   # http://localhost:3000 , admin: /admin
```

## Production: Vercel (tavsiya) yoki Render

**Vercel:** vercel.com/new → repo import → **Root Directory: `lor-website`**. Storage → Neon Postgres ulang (DATABASE_URL va DATABASE_URL_UNPOOLED avtomatik qo'shiladi). Environment: `SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Build `vercel-build` skripti orqali avtomatik: migratsiya + seed + build.

### Render

1. PostgreSQL bazasi yarating va `DATABASE_URL` ni oling.
2. Web Service: Root directory `lor-website`
   - Build: `npm install && npx prisma migrate deploy && npm run build`
   - Start: `npm start`
3. Environment: `DATABASE_URL`, `SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (kamida 10 belgi).
4. Bir marta: `npm run db:seed` (Render Shell orqali). Keyin parolni admin panel → Sozlamalar'dan almashtiring.

`render.yaml` fayli ham tayyor (Blueprint sifatida ishlatish mumkin).

## Ishga tushirishdan oldin to'ldiring

Seed faqat **joy egallovchi** ma'lumot qo'yadi — `[KVADRAT QAVS]` ichidagi hamma narsa admin paneldan almashtirilishi kerak:

- **Shifokor profili:** F.I.Sh., tavsif, biografiya, surat URL, ta'lim, tajriba, sertifikatlar, klinika, telefon, manzil, ijtimoiy tarmoqlar.
- **Raqamlar** (tajriba yili, bemorlar soni va h.k.) — bo'sh qoldirilsa, saytda ko'rsatilmaydi. Faqat haqiqiy ma'lumot kiriting.
- **Xizmatlar va narxlar** — demo ro'yxat; klinika amaliyotiga moslang.
- **Fikrlar** — bo'sh; faqat haqiqiy bemor fikrlarini qo'shing.

## Eslatmalar

- Til: o'zbek (lotin). Barcha matnlar `src/lib/i18n/uz.ts` da — yangi til qo'shish uchun faylni nusxalab tarjima qiling.
- Rate limiter xotirada ishlaydi (bitta server uchun yetarli). Bir nechta instansiyada Redis kabi umumiy saqlash kerak.
- Rasmlar admin paneldan yuklanadi (brauzerda siqiladi, PostgreSQL'da saqlanadi, `/media/<id>` orqali beriladi) — Render diski vaqtinchalik bo'lgani uchun. Katta hajmlar uchun keyinchalik S3/R2 ga o'tkazish mumkin.
- Ikki marta band qilishdan himoya `prisma/migrations/*_init/migration.sql` dagi qo'lda yozilgan partial index'ga tayanadi. Kelajakda `prisma migrate dev` uni o'chirishni taklif qilsa — rad eting va index'ni saqlang.

## Tuzilma

```
prisma/            schema, migratsiyalar, seed
src/app/(site)/    ommaviy sayt va /book, ommaviy server actions
src/app/admin/     login, (panel) sahifalari, actions/
src/app/api/       /api/availability (faqat bo'sh vaqtlar, bemor ma'lumotisiz)
src/components/    site/ (bo'limlar, booking), admin/ (forma, toast, dialog)
src/lib/           db, auth, slots (jadval mantiqi), validation, i18n, format
```
