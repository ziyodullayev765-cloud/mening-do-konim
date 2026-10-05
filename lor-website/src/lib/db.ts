import { PrismaClient } from "@prisma/client";

/**
 * Serverless hosts (Vercel + Neon) give a PgBouncer-pooled URL; Prisma needs
 * `pgbouncer=true` there to avoid prepared-statement conflicts.
 */
function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (url.includes("-pooler.") && !url.includes("pgbouncer=")) {
    return url + (url.includes("?") ? "&" : "?") + "pgbouncer=true";
  }
  return url;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: databaseUrl() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
