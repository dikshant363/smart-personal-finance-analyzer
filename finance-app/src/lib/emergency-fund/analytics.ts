import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export type Db = typeof prisma;

export interface EssentialCategoryBreakdown {
  categoryName: string;
  amount: number;
  percentage: number;
}

export async function getEssentialExpensesBreakdown(
  userId: string,
  db: Db = prisma
): Promise<EssentialCategoryBreakdown[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Last month

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      type: "Expense",
      date: { gte: start, lte: now },
      category: {
        name: {
          in: [
            "Rent", "Mortgage", "Housing",
            "Groceries", "Supermarket",
            "Utilities", "Electricity", "Gas", "Water", "Internet", "Bills",
            "Insurance", "Medical", "Healthcare",
            "EMI", "Loan", "Debt", "Credit Card",
            "Education", "Tuition"
          ],
        },
      },
    },
    include: { category: true },
  });

  const categoryTotals: Record<string, number> = {};
  let totalEssential = 0;

  for (const t of transactions) {
    const catName = t.category?.name || "Other Essential";
    const amt = toNumber(t.amount);
    categoryTotals[catName] = (categoryTotals[catName] || 0) + amt;
    totalEssential += amt;
  }

  const breakdown: EssentialCategoryBreakdown[] = Object.keys(categoryTotals).map((catName) => ({
    categoryName: catName,
    amount: Math.round(categoryTotals[catName] * 100) / 100,
    percentage: totalEssential > 0 ? Math.round((categoryTotals[catName] / totalEssential) * 100) : 0,
  }));

  return breakdown.sort((a, b) => b.amount - a.amount);
}
