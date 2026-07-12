-- CreateTable
CREATE TABLE "OfflineSyncQueue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfflineSyncQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfflineSyncQueue_userId_idx" ON "OfflineSyncQueue"("userId");

-- AddForeignKey
ALTER TABLE "OfflineSyncQueue" ADD CONSTRAINT "OfflineSyncQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
