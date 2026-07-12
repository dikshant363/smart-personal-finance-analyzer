import { prisma } from "@/lib/prisma";
import { getUpcomingPayments } from "./schedule";

export type Db = typeof prisma;

export interface MonthlyCommitmentPoint {
  monthName: string;
  recurringExpenses: number;
  recurringIncome: number;
}

export async function getRecurringForecast(
  userId: string,
  monthsAhead = 6,
  db: Db = prisma
): Promise<MonthlyCommitmentPoint[]> {
  const points: MonthlyCommitmentPoint[] = [];
  const now = new Date();

  for (let i = 0; i < monthsAhead; i++) {
    const start = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + i + 1, 0);

    const monthName = start.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const payments = await getUpcomingPayments(userId, start, end, db);

    const recurringExpenses = payments
      .filter((p) => p.type === "Expense")
      .reduce((sum, p) => sum + p.amount, 0);

    const recurringIncome = payments
      .filter((p) => p.type === "Income")
      .reduce((sum, p) => sum + p.amount, 0);

    points.push({
      monthName,
      recurringExpenses: Math.round(recurringExpenses * 100) / 100,
      recurringIncome: Math.round(recurringIncome * 100) / 100,
    });
  }

  return points;
}
