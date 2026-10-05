import "server-only";
import { db } from "@/lib/db";
import { MEDIA_URL_RE } from "@/lib/media-shared";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB (client resizes before upload)

/** Detects the real image type from magic bytes — never trust the client's MIME. */
export function sniffImageMime(buf: Uint8Array): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  const riff = String.fromCharCode(...buf.slice(0, 4));
  const webp = String.fromCharCode(...buf.slice(8, 12));
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  return null;
}

export function mediaIdFromUrl(url: string | null | undefined) {
  const m = url ? MEDIA_URL_RE.exec(url) : null;
  return m ? m[1] : null;
}

/**
 * Deletes uploaded images that are no longer referenced anywhere.
 * Call with the URLs that were just replaced/removed.
 */
export async function deleteUnusedMedia(urls: (string | null | undefined)[]) {
  const ids = [...new Set(urls.map(mediaIdFromUrl).filter((x): x is string => Boolean(x)))];
  if (ids.length === 0) return;
  const [doctor, services] = await Promise.all([
    db.doctor.findUnique({ where: { id: 1 }, select: { photoUrl: true, aboutPhotoUrl: true, contactPhotoUrl: true, logoUrl: true } }),
    db.service.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
  ]);
  const used = new Set(
    [doctor?.photoUrl, doctor?.aboutPhotoUrl, doctor?.contactPhotoUrl, doctor?.logoUrl, ...services.map((s) => s.imageUrl)]
      .map(mediaIdFromUrl)
      .filter(Boolean),
  );
  const unused = ids.filter((id) => !used.has(id));
  if (unused.length) await db.media.deleteMany({ where: { id: { in: unused } } });
}
