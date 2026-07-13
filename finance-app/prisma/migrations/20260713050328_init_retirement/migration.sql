-- CreateTable
CREATE TABLE "RetirementPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profileType" TEXT NOT NULL,
    "currentAge" INTEGER NOT NULL,
    "retirementAge" INTEGER NOT NULL,
    "lifeExpectancy" INTEGER NOT NULL,
    "currentSavings" DOUBLE PRECISION NOT NULL,
    "monthlyContribution" DOUBLE PRECISION NOT NULL,
    "expectedExpenses" DOUBLE PRECISION NOT NULL,
    "expectedReturn" DOUBLE PRECISION NOT NULL,
    "expectedInflation" DOUBLE PRECISION NOT NULL,
    "withdrawalStrategy" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "workspaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetirementPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RetirementPlan_userId_idx" ON "RetirementPlan"("userId");

-- CreateIndex
CREATE INDEX "RetirementPlan_workspaceId_idx" ON "RetirementPlan"("workspaceId");

-- AddForeignKey
ALTER TABLE "RetirementPlan" ADD CONSTRAINT "RetirementPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetirementPlan" ADD CONSTRAINT "RetirementPlan_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
