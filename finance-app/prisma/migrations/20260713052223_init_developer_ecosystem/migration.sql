-- CreateTable
CREATE TABLE "DeveloperExtension" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Disabled',
    "webhookUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperExtension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeveloperExtension_userId_idx" ON "DeveloperExtension"("userId");

-- AddForeignKey
ALTER TABLE "DeveloperExtension" ADD CONSTRAINT "DeveloperExtension_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
