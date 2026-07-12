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
  type: string;
  estimatedMonthlyContribution: number;
  actualMonthlyContribution: number;
  expectedCompletion: Date | null;
  forecastCompletion: Date | null;
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

function mapGoal(g: any) {
  return {
    ...g,
    targetAmount: toNum(g.targetAmount),
    currentAmount: toNum(g.currentAmount),
    estimatedMonthlyContribution: toNum(g.estimatedMonthlyContribution),
    actualMonthlyContribution: toNum(g.actualMonthlyContribution),
    progress: computeGoalProgress({
      currentAmount: toNum(g.currentAmount),
      targetAmount: toNum(g.targetAmount),
    }),
    milestones: g.milestones
      ? g.milestones.map((m: any) => ({
          ...m,
          amount: toNum(m.amount),
        }))
      : [],
    contributions: g.contributions
      ? g.contributions.map((c: any) => ({
          ...c,
          amount: toNum(c.amount),
        }))
      : [],
  };
}

export async function listGoals(userId: string, status?: string, db: Db = prisma) {
  const where: any = { userId };
  if (status) {
    where.status = status;
  }

  const goals = await db.goal.findMany({
    where,
    include: {
      milestones: true,
      contributions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return goals.map(mapGoal);
}

export async function getGoal(userId: string, goalId: string, db: Db = prisma) {
  const goal = await db.goal.findUnique({
    where: { id: goalId },
    include: {
      milestones: true,
      contributions: true,
    },
  });

  if (!goal || goal.userId !== userId) return null;

  return mapGoal(goal);
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
      type: data.type ?? "custom",
      estimatedMonthlyContribution: data.estimatedMonthlyContribution ?? 0,
      actualMonthlyContribution: data.actualMonthlyContribution ?? 0,
      expectedCompletion: data.expectedCompletion ? new Date(data.expectedCompletion) : null,
      forecastCompletion: data.forecastCompletion ? new Date(data.forecastCompletion) : null,
    },
    include: {
      milestones: true,
      contributions: true,
    },
  });

  return mapGoal(created);
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
      description: data.description !== undefined ? data.description : undefined,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      currency: data.currency,
      deadline: data.deadline !== undefined ? (data.deadline ? new Date(data.deadline) : null) : undefined,
      priority: data.priority,
      status: data.status,
      type: data.type,
      estimatedMonthlyContribution: data.estimatedMonthlyContribution,
      actualMonthlyContribution: data.actualMonthlyContribution,
      expectedCompletion: data.expectedCompletion !== undefined ? (data.expectedCompletion ? new Date(data.expectedCompletion) : null) : undefined,
      forecastCompletion: data.forecastCompletion !== undefined ? (data.forecastCompletion ? new Date(data.forecastCompletion) : null) : undefined,
    },
    include: {
      milestones: true,
      contributions: true,
    },
  });

  return mapGoal(updated);
}

export async function deleteGoal(userId: string, goalId: string, db: Db = prisma) {
  const existing = await db.goal.findUnique({
    where: { id: goalId },
  });
  if (!existing || existing.userId !== userId) return false;

  await db.goal.delete({ where: { id: goalId } });
  return true;
}

export async function addContribution(
  userId: string,
  goalId: string,
  amount: number,
  description?: string | null,
  db: Db = prisma
) {
  const goal = await db.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== userId) throw new Error("Goal not found");

  const [contribution, updatedGoal] = await db.$transaction([
    db.goalContribution.create({
      data: {
        goalId,
        amount,
        description: description ?? null,
      },
    }),
    db.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: { increment: amount },
      },
    }),
  ]);

  // Check and trigger milestone achievements after adding contribution
  const milestones = await db.goalMilestone.findMany({ where: { goalId } });
  const progressPercent = computeGoalProgress({
    currentAmount: toNum(updatedGoal.currentAmount),
    targetAmount: toNum(updatedGoal.targetAmount),
  });

  for (const m of milestones) {
    if (!m.achievedAt && progressPercent >= m.percentage) {
      await db.goalMilestone.update({
        where: { id: m.id },
        data: { achievedAt: new Date() },
      });
    }
  }

  return contribution;
}

export async function addMilestone(
  userId: string,
  goalId: string,
  percentage: number,
  isCustom = true,
  db: Db = prisma
) {
  const goal = await db.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== userId) throw new Error("Goal not found");

  const amount = (toNum(goal.targetAmount) * percentage) / 100;
  const progressPercent = computeGoalProgress({
    currentAmount: toNum(goal.currentAmount),
    targetAmount: toNum(goal.targetAmount),
  });

  return db.goalMilestone.create({
    data: {
      goalId,
      percentage,
      amount,
      isCustom,
      achievedAt: progressPercent >= percentage ? new Date() : null,
    },
  });
}

export async function deleteMilestone(
  userId: string,
  goalId: string,
  milestoneId: string,
  db: Db = prisma
) {
  const goal = await db.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== userId) return false;

  await db.goalMilestone.delete({ where: { id: milestoneId } });
  return true;
}
