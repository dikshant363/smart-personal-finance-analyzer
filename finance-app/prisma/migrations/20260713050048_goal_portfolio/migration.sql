-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "portfolioId" TEXT;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
