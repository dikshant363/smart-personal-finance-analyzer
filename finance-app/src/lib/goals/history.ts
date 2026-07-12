import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export type Db = typeof prisma;

export interface GoalHistoryLog {
  id: string;
  goalId: string;
  amount: number;
  date: Date;
  description: string | null;
}

export async function getGoalContributionHistory(
  userId: string,
  goalId: string,
  db: Db = prisma
): Promise<GoalHistoryLog[]> {
  const goal = await db.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== userId) throw new Error("Goal not found");

  const contributions = await db.goalContribution.findMany({
    where: { goalId },
    orderBy: { date: "desc" },
  });

  return contributions.map((c) => ({
    id: c.id,
    goalId: c.goalId,
    amount: toNumber(c.amount),
    date: c.date,
    description: c.description,
  }));
}

export async function getGoalMilestones(
  userId: string,
  goalId: string,
  db: Db = prisma
) {
  const goal = await db.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== userId) throw new Error("Goal not found");

  const milestones = await db.goalMilestone.findMany({
    where: { goalId },
    orderBy: { percentage: "asc" },
  });

  return milestones.map((m) => ({
    id: m.id,
    goalId: m.goalId,
    percentage: m.percentage,
    amount: toNumber(m.amount),
    achievedAt: m.achievedAt,
    isCustom: m.isCustom,
  }));
}
