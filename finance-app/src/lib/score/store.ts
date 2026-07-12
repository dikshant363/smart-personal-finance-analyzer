import { prisma } from "@/lib/prisma";
import type { ScoreDimension, ScoreResult, ScoreTrendPoint } from "./types";

export type Db = typeof prisma;

export async function saveMonthlySnapshot(
  userId: string,
  result: ScoreResult,
  db: Db = prisma
): Promise<void> {
  await db.scoreHistory.upsert({
    where: { userId_month: { userId, month: result.month } },
    create: {
      userId,
      month: result.month,
      score: result.score,
      breakdown: result.dimensions as any,
      recommendations: result.recommendations as any,
    },
    update: {
      score: result.score,
      breakdown: result.dimensions as any,
      recommendations: result.recommendations as any,
      updatedAt: new Date(),
    },
  });
}

export async function getLatestSnapshot(
  userId: string,
  db: Db = prisma
): Promise<{ month: string; score: number } | null> {
  const row = await db.scoreHistory.findFirst({
    where: { userId },
    orderBy: { month: "desc" },
  });
  if (!row) return null;
  return { month: row.month, score: row.score };
}

export async function getPreviousMonthDimensions(
  userId: string,
  db: Db = prisma
): Promise<ScoreDimension[] | null> {
  const cur = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const r = await db.scoreHistory.findFirst({
    where: { userId, NOT: { month: cur } },
    orderBy: { month: "desc" },
  });
  return (r?.breakdown as ScoreDimension[] | null) ?? null;
}

export async function getHistory(
  userId: string,
  db: Db = prisma
): Promise<ScoreTrendPoint[]> {
  const rows = await db.scoreHistory.findMany({
    where: { userId },
    orderBy: { month: "asc" },
  });
  return rows.map((r) => ({ period: r.month, score: r.score }));
}
