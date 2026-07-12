import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export async function computeBudgetSpent(
  userId: string,
  budget: { categoryId: string | null }
): Promise<number> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const agg = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      userId,
      type: "Expense",
      date: { gte: start },
      ...(budget.categoryId ? { categoryId: budget.categoryId } : {}),
    },
  });
  return toNumber(agg._sum.amount);
}
