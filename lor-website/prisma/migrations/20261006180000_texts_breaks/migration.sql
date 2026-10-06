-- AlterTable
ALTER TABLE "Setting" ADD COLUMN "loginBackgroundUrl" TEXT,
ADD COLUMN "texts" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "WorkingDay" ADD COLUMN "breakStart" TEXT NOT NULL DEFAULT '',
ADD COLUMN "breakEnd" TEXT NOT NULL DEFAULT '';
