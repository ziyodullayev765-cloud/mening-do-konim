-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "addressRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "biographyRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "certificationsRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "clinicNameRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "educationRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "heroBadgeRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "heroTitleRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "membershipsRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "professionalHistoryRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shortDescriptionRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "specializationsRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "titleRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "trainingRu" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Faq" ADD COLUMN     "answerRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "questionRu" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "descriptionRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "indicationRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nameRu" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "recoveryRu" TEXT NOT NULL DEFAULT '';
