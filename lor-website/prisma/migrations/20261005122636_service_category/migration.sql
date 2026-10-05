-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('CONSULTATION', 'DIAGNOSTICS', 'TREATMENT', 'SURGERY');

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "category" "ServiceCategory" NOT NULL DEFAULT 'CONSULTATION';

-- CreateIndex
CREATE INDEX "Service_category_idx" ON "Service"("category");

-- Backfill: existing procedures become "TREATMENT"; obvious diagnostics by name.
UPDATE "Service" SET "category" = 'TREATMENT' WHERE "kind" = 'PROCEDURE';
UPDATE "Service" SET "category" = 'DIAGNOSTICS'
  WHERE "kind" = 'SERVICE' AND ("name" ILIKE '%tekshiruv%' OR "name" ILIKE '%endoskop%' OR "name" ILIKE '%audiometr%');
