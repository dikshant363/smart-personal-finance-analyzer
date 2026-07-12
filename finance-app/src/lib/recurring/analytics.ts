import { prisma } from "@/lib/prisma";
import { listRecurringItems } from "./repository";
import { getUpcomingPayments } from "./schedule";
import { toNumber } from "@/lib/currency";

export type Db = typeof prisma;

export interface RecurringAnalytics {
  monthlyRecurringExpenses: number;
  yearlyRecurringExpenses: number;
  recurringIncome: number;
  recurringExpenseRatio: number;
  largestRecurringExpenses: { name: string; amount: number; frequency: string }[];
  upcomingObligationsCount: number;
  missedPaymentsCount: number;
}

export async function getRecurringAnalytics(
  userId: string,
  db: Db = prisma
): Promise<RecurringAnalytics> {
  const items = await listRecurringItems(userId, db);
  const activeItems = items.filter((i) => i.status === "Active");

  let monthlyRecurringExpenses = 0;
  let recurringIncome = 0;
  const largestRecurringExpenses: RecurringAnalytics["largestRecurringExpenses"] = [];

  for (const item of activeItems) {
    const amt = item.amount;
    let monthlyEquivalent = 0;

    if (item.frequency === "Weekly") monthlyEquivalent = amt * 4.345;
    else if (item.frequency === "Biweekly") monthlyEquivalent = amt * 2.17;
    else if (item.frequency === "Monthly") monthlyEquivalent = amt;
    else if (item.frequency === "Quarterly") monthlyEquivalent = amt / 3;
    else if (item.frequency === "Annual") monthlyEquivalent = amt / 12;
    else if (item.frequency === "Daily") monthlyEquivalent = amt * 30.43;

    if (item.type === "Expense") {
      monthlyRecurringExpenses += monthlyEquivalent;
      largestRecurringExpenses.push({
        name: item.name,
        amount: amt,
        frequency: item.frequency,
      });
    } else {
      recurringIncome += monthlyEquivalent;
    }
  }

  largestRecurringExpenses.sort((a, b) => b.amount - a.amount);

  // Calculate user's total historical monthly expenses for the ratio
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const txSum = await db.transaction.groupBy({
    by: ["type"],
    where: {
      userId,
      date: { gte: start, lte: now },
    },
    _sum: { amount: true },
  });

  const totalExpense = toNumber(txSum.find((t) => t.type === "Expense")?._sum.amount || 0);
  const avgTotalMonthlyExpense = totalExpense / 3;
  const recurringExpenseRatio = avgTotalMonthlyExpense > 0
    ? (monthlyRecurringExpenses / avgTotalMonthlyExpense) * 100
    : 0;

  // Get upcoming obligations in the next 30 days
  const endPeriod = new Date();
  endPeriod.setDate(now.getDate() + 30);
  const upcoming = await getUpcomingPayments(userId, now, endPeriod, db);

  const upcomingObligationsCount = upcoming.filter((p) => p.status === "Pending").length;
  const missedPaymentsCount = upcoming.filter((p) => p.status === "Overdue").length;

  return {
    monthlyRecurringExpenses: Math.round(monthlyRecurringExpenses * 100) / 100,
    yearlyRecurringExpenses: Math.round(monthlyRecurringExpenses * 12 * 100) / 100,
    recurringIncome: Math.round(recurringIncome * 100) / 100,
    recurringExpenseRatio: Math.round(recurringExpenseRatio * 10) / 10,
    largestRecurringExpenses: largestRecurringExpenses.slice(0, 5),
    upcomingObligationsCount,
    missedPaymentsCount,
  };
}
