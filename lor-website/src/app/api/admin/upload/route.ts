import { NextResponse, type NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { MAX_UPLOAD_BYTES, sniffImageMime } from "@/lib/media";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * POST multipart/form-data { file } -> { url: "/media/<id>" }
 * Admin-only. Same-origin check protects against CSRF.
 */
export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Avtorizatsiya talab qilinadi." }, { status: 401 });

  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return NextResponse.json({ error: "Ruxsat etilmagan so'rov." }, { status: 403 });
  }

  const ip = await clientIp();
  if (!rateLimit(`upload:${admin.id}:${ip}`, 40, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Juda ko'p yuklash. Birozdan so'ng urinib ko'ring." }, { status: 429 });
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get("file");
  } catch {
    return NextResponse.json({ error: "Fayl o'qilmadi." }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: "Fayl tanlanmagan." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Rasm hajmi 4 MB dan oshmasligi kerak." }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImageMime(bytes);
  if (!mime) return NextResponse.json({ error: "Faqat JPG, PNG yoki WEBP rasm yuklash mumkin." }, { status: 415 });

  try {
    const media = await db.media.create({ data: { mime, size: bytes.length, data: bytes }, select: { id: true } });
    return NextResponse.json({ url: `/media/${media.id}` });
  } catch (e) {
    console.error("upload failed", e);
    return NextResponse.json({ error: "Serverda xatolik. Qayta urinib ko'ring." }, { status: 500 });
  }
}
