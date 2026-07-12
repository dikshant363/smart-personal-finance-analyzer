-- CreateTable
CREATE TABLE "ExchangeAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "dataset" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExchangeAudit_userId_idx" ON "ExchangeAudit"("userId");

-- CreateIndex
CREATE INDEX "ExchangeAudit_userId_action_idx" ON "ExchangeAudit"("userId", "action");

-- AddForeignKey
ALTER TABLE "ExchangeAudit" ADD CONSTRAINT "ExchangeAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
