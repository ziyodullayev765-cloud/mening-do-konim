-- Telegram chat that receives new-booking notifications (connected in Admin -> Settings)
ALTER TABLE "Setting" ADD COLUMN "telegramChatId" TEXT;
ALTER TABLE "Setting" ADD COLUMN "telegramChatName" TEXT;
