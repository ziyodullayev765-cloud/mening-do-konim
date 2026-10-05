-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "contactPhotoUrl" TEXT,
ADD COLUMN     "heroTitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "logoUrl" TEXT;

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);
