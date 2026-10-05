import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "lor_admin_session";
const SHORT_SESSION_MS = 12 * 60 * 60 * 1000; // 12h
const LONG_SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days ("remember me")

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(adminId: string, remember: boolean) {
  const token = randomBytes(32).toString("base64url");
  const ttl = remember ? LONG_SESSION_MS : SHORT_SESSION_MS;
  const expiresAt = new Date(Date.now() + ttl);
  await db.session.create({ data: { adminId, tokenHash: hashToken(token), expiresAt } });
  // Opportunistic cleanup of expired sessions.
  await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { expires: expiresAt } : {}),
  });
}

/** Returns the logged-in admin or null. Cached per request. */
export const getAdmin = cache(async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { admin: { select: { id: true, email: true, name: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.admin;
});

/** Use at the top of every admin page and admin server action. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  jar.delete(SESSION_COOKIE);
}
