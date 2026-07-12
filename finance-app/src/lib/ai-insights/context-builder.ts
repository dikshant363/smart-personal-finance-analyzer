import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";
import { calculateHealthScore } from "@/lib/score/engine";
import { analyzeSpending } from "@/lib/analysis/analyze";
import { listRecommendations } from "@/lib/recommendations/repository";
import { generateForecast } from "@/lib/forecasting/engine";
import { getLatestSnapshot } from "@/lib/score/store";
import type { AiInsightInput, Db } from "./types";

export async function buildAiContext(userId: string, db: Db = prisma): Promise<AiInsightInput["context"]> {
  const [user, profile, healthScore, analysis, recommendations, forecast] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { name: true } }),
    db.profile.findUnique({ where: { userId } }),
    calculateHealthScore(userId, db),
    analyzeSpending(userId, db),
    listRecommendations(userId, { status: "active" }, "priority", db),
    generateForecast({ userId, period: "30d", scenario: "expected", type: "cashflow" }, db),
  ]);

  const latestSnapshot = await getLatestSnapshot(userId, db);
  const previousSnapshot = latestSnapshot
    ? await db.scoreHistory.findFirst({
        where: { userId, NOT: { month: latestSnapshot.month } },
        orderBy: { month: "desc" },
      })
    : null;
  const trend = latestSnapshot && previousSnapshot ? latestSnapshot.score - previousSnapshot.score : 0;

  const recentTransactions = await db.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 10,
    select: { description: true, amount: true, type: true, date: true },
  });

  return {
    profile: {
      currency: profile?.currency ?? "USD",
      name: user?.name ?? undefined,
    },
    healthScore: {
      score: healthScore.score,
      band: healthScore.band,
      trend,
    },
    analysis: {
      insights: analysis.insights.slice(0, 8).map((insight) => ({
        title: insight.title,
        summary: insight.summary,
        priority: insight.priority,
      })),
      alerts: analysis.alerts.slice(0, 5).map((alert) => ({
        title: alert.title,
        severity: alert.severity,
        detail: alert.detail,
      })),
    },
    recommendations: recommendations.slice(0, 6).map((rec) => ({
      title: rec.title,
      summary: rec.summary,
      priority: rec.priority,
      monthlySavings: rec.monthlySavings,
    })),
    forecast: {
      period: forecast.period,
      scenario: forecast.scenario,
      summary: { changePercent: forecast.summary.changePercent },
      risks: forecast.risks,
    },
    recentTransactions: recentTransactions.map((tx) => ({
      description: tx.description ?? "Untitled",
      amount: toNumber(tx.amount),
      type: tx.type,
      date: tx.date.toISOString(),
    })),
  };
}
