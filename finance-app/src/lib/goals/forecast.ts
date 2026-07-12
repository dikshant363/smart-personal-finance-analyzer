import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";
import { listGoals } from "./repository";
import { calculateGoalMetrics } from "./engine";

export type Db = typeof prisma;

interface ProjectedGoal {
  id: string;
  name: string;
  remainingAmount: number;
  allocatedSavings: number;
  projectedMonths: number | null;
  projectedCompletionDate: Date | null;
  statusOnDeadline: "on_time" | "behind" | "no_deadline";
}

export async function getGoalForecasts(userId: string, db: Db = prisma): Promise<{
  averageMonthlySavings: number;
  forecasts: ProjectedGoal[];
}> {
  // 1. Calculate user's average monthly savings over the last 6 months
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const transactions = await db.transaction.groupBy({
    by: ["type"],
    where: {
      userId,
      date: { gte: start, lte: now },
    },
    _sum: { amount: true },
  });

  const income = toNumber(transactions.find((t) => t.type === "Income")?._sum.amount);
  const expense = toNumber(transactions.find((t) => t.type === "Expense")?._sum.amount);
  const totalSavings = Math.max(0, income - expense);
  const averageMonthlySavings = totalSavings / 6;

  // 2. Fetch all active goals
  const goals = await listGoals(userId, "active", db);

  // 3. Allocate savings based on priority weights
  // Weights: critical = 50%, high = 30%, medium = 15%, low = 5%
  const priorityWeights: Record<string, number> = {
    critical: 50,
    high: 30,
    medium: 15,
    low: 5,
  };

  const activeGoals = goals.filter((g) => g.status === "active");

  const totalWeight = activeGoals.reduce((sum, g) => sum + (priorityWeights[g.priority] ?? 15), 0);

  const forecasts: ProjectedGoal[] = activeGoals.map((g) => {
    const weight = priorityWeights[g.priority] ?? 15;
    const share = totalWeight > 0 ? weight / totalWeight : 0;
    const allocatedSavings = averageMonthlySavings * share;

    const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount);

    let projectedMonths: number | null = null;
    let projectedCompletionDate: Date | null = null;
    let statusOnDeadline: "on_time" | "behind" | "no_deadline" = "no_deadline";

    if (allocatedSavings > 0 && remainingAmount > 0) {
      projectedMonths = remainingAmount / allocatedSavings;
      const daysNeeded = Math.ceil(projectedMonths * 30.436);
      const compDate = new Date();
      compDate.setDate(compDate.getDate() + daysNeeded);
      projectedCompletionDate = compDate;

      if (g.deadline) {
        statusOnDeadline = compDate.getTime() <= new Date(g.deadline).getTime() ? "on_time" : "behind";
      }
    } else if (remainingAmount === 0) {
      projectedMonths = 0;
      projectedCompletionDate = now;
      statusOnDeadline = "on_time";
    }

    return {
      id: g.id,
      name: g.name,
      remainingAmount,
      allocatedSavings: Math.round(allocatedSavings * 100) / 100,
      projectedMonths: projectedMonths != null ? Math.round(projectedMonths * 10) / 10 : null,
      projectedCompletionDate,
      statusOnDeadline,
    };
  });

  return {
    averageMonthlySavings: Math.round(averageMonthlySavings * 100) / 100,
    forecasts,
  };
}
