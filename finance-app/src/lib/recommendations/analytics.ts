import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";
import {
  type RecommendationAnalytics,
  type RecCategory,
} from "./types";

export type Db = typeof prisma;

export async function computeAnalytics(
  userId: string,
  db: Db = prisma
): Promise<RecommendationAnalytics> {
  const rows = await db.recommendation.findMany({ where: { userId } });

  const total = rows.length;
  const accepted = rows.filter((r) => r.status === "accepted").length;
  const completed = rows.filter((r) => r.status === "completed").length;
  const dismissed = rows.filter((r) => r.status === "dismissed").length;

  const acceptanceRate = total === 0 ? 0 : accepted / total;
  const completionRate = total === 0 ? 0 : completed / total;

  const avgMonthlySavings =
    total === 0
      ? 0
      : rows.reduce((sum, r) => sum + toNumber(r.monthlySavings), 0) / total;

  const avgScoreImpact =
    total === 0
      ? 0
      : rows.reduce((sum, r) => sum + (r.scoreImpact ?? 0), 0) / total;

  const counts = new Map<string, number>();
  for (const r of rows) {
    counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  }

  const topCategories = Array.from(counts.entries())
    .map(([category, count]) => ({
      category: category as RecCategory,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total,
    accepted,
    completed,
    dismissed,
    acceptanceRate,
    completionRate,
    avgMonthlySavings,
    avgScoreImpact,
    topCategories,
  };
}
