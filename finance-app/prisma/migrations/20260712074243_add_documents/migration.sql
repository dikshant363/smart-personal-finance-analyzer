-- CreateTable
CREATE TABLE "ProcessedDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "extractedData" JSONB,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcessedDocument_userId_idx" ON "ProcessedDocument"("userId");

-- CreateIndex
CREATE INDEX "ProcessedDocument_userId_status_idx" ON "ProcessedDocument"("userId", "status");

-- AddForeignKey
ALTER TABLE "ProcessedDocument" ADD CONSTRAINT "ProcessedDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
