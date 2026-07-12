import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";
import { GoalInput, GoalUpdateInput } from "@/lib/validation";

export type Db = typeof prisma;

export type GoalRow = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline: Date | null;
  priority: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

function toNum(v: any): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  return Number(v.toNumber());
}

export function computeGoalProgress(goal: {
  currentAmount: number;
  targetAmount: number;
}): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
}

export async function listGoals(userId: string, status?: string, db: Db = prisma) {
  const where: any = { userId };
  if (status) {
    where.status = status;
  }

  const goals = await db.goal.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return goals.map((g) => ({
    ...g,
    targetAmount: toNum(g.targetAmount),
    currentAmount: toNum(g.currentAmount),
    progress: computeGoalProgress({
      currentAmount: toNum(g.currentAmount),
      targetAmount: toNum(g.targetAmount),
    }),
  }));
}

export async function getGoal(userId: string, goalId: string, db: Db = prisma) {
  const goal = await db.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal || goal.userId !== userId) return null;

  return {
    ...goal,
    targetAmount: toNum(goal.targetAmount),
    currentAmount: toNum(goal.currentAmount),
    progress: computeGoalProgress({
      currentAmount: toNum(goal.currentAmount),
      targetAmount: toNum(goal.targetAmount),
    }),
  };
}

export async function createGoal(userId: string, data: GoalInput, db: Db = prisma) {
  const created = await db.goal.create({
    data: {
      userId,
      name: data.name,
      description: data.description ?? null,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount ?? 0,
      currency: data.currency ?? "USD",
      deadline: data.deadline ? new Date(data.deadline) : null,
      priority: data.priority ?? "medium",
      status: data.status ?? "active",
    },
  });

  return {
    ...created,
    targetAmount: toNum(created.targetAmount),
    currentAmount: toNum(created.currentAmount),
    progress: computeGoalProgress({
      currentAmount: toNum(created.currentAmount),
      targetAmount: toNum(created.targetAmount),
    }),
  };
}

export async function updateGoal(
  userId: string,
  goalId: string,
  data: GoalUpdateInput,
  db: Db = prisma
) {
  const existing = await db.goal.findUnique({
    where: { id: goalId },
  });
  if (!existing || existing.userId !== userId) return null;

  const updated = await db.goal.update({
    where: { id: goalId },
    data: {
      name: data.name,
      description: data.description ?? undefined,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      currency: data.currency,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      priority: data.priority,
      status: data.status,
    },
  });

  return {
    ...updated,
    targetAmount: toNum(updated.targetAmount),
    currentAmount: toNum(updated.currentAmount),
    progress: computeGoalProgress({
      currentAmount: toNum(updated.currentAmount),
      targetAmount: toNum(updated.targetAmount),
    }),
  };
}

export async function deleteGoal(userId: string, goalId: string, db: Db = prisma) {
  const existing = await db.goal.findUnique({
    where: { id: goalId },
  });
  if (!existing || existing.userId !== userId) return false;

  await db.goal.delete({ where: { id: goalId } });
  return true;
}
