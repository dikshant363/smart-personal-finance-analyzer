-- CreateTable
CREATE TABLE "EmergencyFundSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetMonths" INTEGER NOT NULL DEFAULT 6,
    "customEssentialExpenses" DECIMAL(12,2),
    "customReserve" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyFundSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyFundHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "coverageMonths" DECIMAL(6,2) NOT NULL,
    "readinessScore" INTEGER NOT NULL,
    "currentReserve" DECIMAL(12,2) NOT NULL,
    "essentialExpenses" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmergencyFundHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyFundSettings_userId_key" ON "EmergencyFundSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyFundHistory_userId_month_key" ON "EmergencyFundHistory"("userId", "month");

-- AddForeignKey
ALTER TABLE "EmergencyFundSettings" ADD CONSTRAINT "EmergencyFundSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyFundHistory" ADD CONSTRAINT "EmergencyFundHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
