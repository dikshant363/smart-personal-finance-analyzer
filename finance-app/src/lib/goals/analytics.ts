import { prisma } from "@/lib/prisma";
import { listGoals } from "./repository";
import { calculateGoalMetrics } from "./engine";

export type Db = typeof prisma;

export interface GoalAnalyticsSummary {
  totalTarget: number;
  totalSaved: number;
  overallProgress: number;
  totalMonthlyEstimated: number;
  totalMonthlyActual: number;
  statusCounts: {
    planning: number;
    active: number;
    behind_schedule: number;
    ahead_of_schedule: number;
    completed: number;
    paused: number;
    archived: number;
    cancelled: number;
  };
  typeBreakdown: Record<string, { target: number; saved: number; count: number }>;
}

export async function getGoalAnalytics(
  userId: string,
  db: Db = prisma
): Promise<GoalAnalyticsSummary> {
  const goals = await listGoals(userId, undefined, db);

  let totalTarget = 0;
  let totalSaved = 0;
  let totalMonthlyEstimated = 0;
  let totalMonthlyActual = 0;

  const statusCounts = {
    planning: 0,
    active: 0,
    behind_schedule: 0,
    ahead_of_schedule: 0,
    completed: 0,
    paused: 0,
    archived: 0,
    cancelled: 0,
  };

  const typeBreakdown: Record<string, { target: number; saved: number; count: number }> = {};

  for (const goal of goals) {
    const metrics = calculateGoalMetrics({
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline ? new Date(goal.deadline) : null,
      createdAt: new Date(goal.createdAt),
      estimatedMonthlyContribution: goal.estimatedMonthlyContribution,
      actualMonthlyContribution: goal.actualMonthlyContribution,
      status: goal.status,
    });

    const statusKey = metrics.status as keyof typeof statusCounts;
    if (statusKey in statusCounts) {
      statusCounts[statusKey]++;
    }

    if (goal.status !== "archived" && goal.status !== "cancelled") {
      totalTarget += goal.targetAmount;
      totalSaved += goal.currentAmount;
      totalMonthlyEstimated += goal.estimatedMonthlyContribution;
      totalMonthlyActual += goal.actualMonthlyContribution;
    }

    const typeKey = goal.type || "custom";
    if (!typeBreakdown[typeKey]) {
      typeBreakdown[typeKey] = { target: 0, saved: 0, count: 0 };
    }
    typeBreakdown[typeKey].target += goal.targetAmount;
    typeBreakdown[typeKey].saved += goal.currentAmount;
    typeBreakdown[typeKey].count++;
  }

  const overallProgress = totalTarget > 0
    ? Math.round((totalSaved / totalTarget) * 100)
    : 0;

  return {
    totalTarget: Math.round(totalTarget * 100) / 100,
    totalSaved: Math.round(totalSaved * 100) / 100,
    overallProgress,
    totalMonthlyEstimated: Math.round(totalMonthlyEstimated * 100) / 100,
    totalMonthlyActual: Math.round(totalMonthlyActual * 100) / 100,
    statusCounts,
    typeBreakdown,
  };
}
