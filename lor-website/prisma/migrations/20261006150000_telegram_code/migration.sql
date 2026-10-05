-- Telegram recipients: any chat that sent the bot the correct access code.
CREATE TABLE "TelegramChat" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TelegramChat_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TelegramChat_chatId_key" ON "TelegramChat"("chatId");

-- Keep a chat that was already connected with the previous "Connect" button.
INSERT INTO "TelegramChat" ("id", "chatId", "name", "verified", "updatedAt")
SELECT 'migrated_' || "telegramChatId", "telegramChatId", COALESCE("telegramChatName", ''), true, CURRENT_TIMESTAMP
FROM "Setting" WHERE "telegramChatId" IS NOT NULL;

ALTER TABLE "Setting" DROP COLUMN "telegramChatId";
ALTER TABLE "Setting" DROP COLUMN "telegramChatName";
-- Access code people send to the bot to receive notifications (set in Admin -> Settings).
ALTER TABLE "Setting" ADD COLUMN "telegramCode" TEXT;
