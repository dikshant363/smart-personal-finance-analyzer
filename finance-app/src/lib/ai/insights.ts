import { prisma } from "@/lib/prisma";
import { InsightContext } from "./types";
import { toNumber } from "@/lib/currency";

export async function buildInsightContext(userId: string): Promise<InsightContext> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  const currency = profile?.currency ?? "USD";
  const monthLabel = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const totalsAgg = await prisma.transaction.groupBy({
    by: ["type"],
    where: { userId, date: { gte: monthStart } },
    _sum: { amount: true },
  });

  const totals = { income: 0, expense: 0, net: 0 };
  for (const row of totalsAgg) {
    const sum = toNumber(row._sum.amount);
    if (row.type === "Income") totals.income = sum;
    if (row.type === "Expense") totals.expense = sum;
  }
  totals.net = totals.income - totals.expense;

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 15,
    select: {
      description: true,
      amount: true,
      type: true,
      category: { select: { name: true } },
      date: true,
    },
  });

  const budgets = await prisma.budget.findMany({
    where: { userId },
    include: { category: { select: { name: true } } },
  });

  const budgetSpending = await Promise.all(
    budgets.map(async (budget) => {
      const spentAgg = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          type: "Expense",
          date: { gte: monthStart },
          ...(budget.categoryId ? { categoryId: budget.categoryId } : {}),
        },
      });
      return {
        name: budget.name,
        amount: toNumber(budget.amount),
        spent: toNumber(spentAgg._sum.amount),
      };
    })
  );

  return {
    currency,
    monthLabel,
    totals,
    recentTransactions: recentTransactions.map((tx) => ({
      description: tx.description,
      amount: toNumber(tx.amount),
      type: tx.type,
      category: tx.category?.name ?? null,
      date: tx.date.toISOString(),
    })),
    budgets: budgetSpending,
  };
}
