/** Client-safe helpers for uploaded media URLs ("/media/<id>"). */
export const MEDIA_URL_RE = /^\/media\/([a-z0-9]{20,40})$/;

/** An image reference may be an uploaded file (/media/…) or an external https URL. */
export function isValidImageRef(value: string) {
  return value === "" || MEDIA_URL_RE.test(value) || /^https:\/\/[^\s]+\.[^\s]+$/.test(value);
}

export const IMAGE_REF_ERROR = "Rasmni yuklang yoki https:// bilan boshlanadigan manzil kiriting.";
