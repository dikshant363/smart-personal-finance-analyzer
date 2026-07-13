import { prisma } from "@/lib/prisma";
import { computeInsights } from "./insights";
import { buildTrends } from "./trends";
import { getCached, setCached, cacheKey } from "./cache";
import type { AnalysisResult } from "./types";

export type Db = typeof prisma;

export async function analyzeSpending(userId: string, db: Db = prisma): Promise<AnalysisResult> {
  const cached = getCached<AnalysisResult>(cacheKey(userId, "spending"));
  if (cached) return cached;
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { currency: true },
  });
  const currency = profile?.currency ?? "USD";
  const { insights, alerts } = await computeInsights(userId, db, currency);
  const trends = await buildTrends(userId, db);
  const result: AnalysisResult = {
    insights,
    alerts,
    trends,
    generatedAt: new Date().toISOString(),
  };
  setCached(cacheKey(userId, "spending"), result);
  return result;
}

export async function getAnalysis(userId: string, db: Db = prisma): Promise<AnalysisResult> {
  return analyzeSpending(userId, db);
}
