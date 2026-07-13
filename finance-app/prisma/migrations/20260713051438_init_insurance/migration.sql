-- CreateTable
CREATE TABLE "InsurancePolicy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "policyNumber" TEXT,
    "category" TEXT NOT NULL,
    "coverageAmount" DOUBLE PRECISION NOT NULL,
    "premiumAmount" DOUBLE PRECISION NOT NULL,
    "billingFrequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "beneficiaries" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "workspaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsurancePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InsurancePolicy_userId_idx" ON "InsurancePolicy"("userId");

-- CreateIndex
CREATE INDEX "InsurancePolicy_workspaceId_idx" ON "InsurancePolicy"("workspaceId");

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
