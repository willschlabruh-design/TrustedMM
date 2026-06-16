-- CreateTable
CREATE TABLE IF NOT EXISTS "UserSettings" (
    "userId" TEXT NOT NULL,
    "notifyTradeUpdates" BOOLEAN NOT NULL DEFAULT true,
    "notifyDisputeUpdates" BOOLEAN NOT NULL DEFAULT true,
    "notifyMessages" BOOLEAN NOT NULL DEFAULT true,
    "notifySecurityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "notifyMarketing" BOOLEAN NOT NULL DEFAULT false,
    "profileVisibility" TEXT NOT NULL DEFAULT 'TRADES_ONLY',
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "compactUi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
