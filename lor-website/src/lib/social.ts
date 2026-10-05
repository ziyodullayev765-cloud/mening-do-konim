/** "@user", "user" or "https://instagram.com/user/?x" -> "user" (or "" if it can't be parsed). */
export function instagramUsername(value: string) {
  const v = value.trim();
  if (!v) return "";
  const fromUrl = v.match(/instagram\.com\/([^/?#\s]+)/i);
  const name = (fromUrl ? fromUrl[1] : v).replace(/^@/, "").trim();
  return name;
}

export function instagramHref(value: string) {
  const user = instagramUsername(value);
  return user ? `https://www.instagram.com/${user}/` : "";
}
