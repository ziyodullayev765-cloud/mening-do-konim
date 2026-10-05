"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { failure, type ActionState } from "@/lib/action";
import { createSession, destroySession } from "@/lib/auth";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

// Compared against when the login is unknown so response time doesn't reveal valid logins.
const DUMMY_HASH = bcrypt.hashSync("timing-equaliser-not-a-real-password", 12);

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure(t.admin.login.invalid);
  const { email, password, remember } = parsed.data;

  const ip = await clientIp();
  const key = `login:${ip}:${email.toLowerCase()}`;
  if (!rateLimit(key, 5, 15 * 60 * 1000).ok || !rateLimit(`login-ip:${ip}`, 30, 15 * 60 * 1000).ok) {
    return failure(t.common.tooManyRequests);
  }

  const admin = await db.admin.findUnique({ where: { email: email.toLowerCase() } });
  const valid = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !valid) return failure(t.admin.login.invalid);

  resetRateLimit(key);
  await createSession(admin.id, remember);
  redirect("/admin");
}

export async function logout() {
  const t = await getT();
  await destroySession();
  redirect("/admin/login");
}
