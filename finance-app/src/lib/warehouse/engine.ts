import { prisma } from "@/lib/prisma";

export interface AnalyticsFactTable {
  userId: string;
  totalAssets: number;
  totalSpending: number;
  savingsRate: number;
  snapshotDate: string;
}

export async function extractDailySnapshot(userId: string, db = prisma): Promise<AnalyticsFactTable> {
  const transactions = await db.transaction.findMany({
    where: { userId },
  });

  const totalSpending = transactions
    .filter(t => t.type === "Expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalIncome = transactions
    .filter(t => t.type === "Income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome) * 100 : 0;

  // Mock read-optimized aggregate facts
  return {
    userId,
    totalAssets: totalIncome * 1.5,
    totalSpending,
    savingsRate: Math.max(0, Math.round(savingsRate * 100) / 100),
    snapshotDate: new Date().toISOString().split("T")[0],
  };
}
