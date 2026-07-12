-- CreateTable
CREATE TABLE "FinancialScenario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "priority" TEXT NOT NULL,
    "assumptions" TEXT,
    "estimatedCost" DECIMAL(18,2) NOT NULL,
    "expectedIncomeImpact" DECIMAL(18,2) NOT NULL,
    "expectedExpenseImpact" DECIMAL(18,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialScenario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialScenario_userId_idx" ON "FinancialScenario"("userId");

-- CreateIndex
CREATE INDEX "FinancialScenario_userId_status_idx" ON "FinancialScenario"("userId", "status");

-- AddForeignKey
ALTER TABLE "FinancialScenario" ADD CONSTRAINT "FinancialScenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
