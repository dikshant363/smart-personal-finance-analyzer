import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";
import type { ForecastResult, ForecastPeriod, ForecastScenario, ForecastType } from "./types";

export type Db = typeof prisma;

async function toJson(data: ForecastResult) {
  return {
    ...data,
    confidence: data.confidence ?? null,
  };
}

export async function saveForecast(
  userId: string,
  result: ForecastResult,
  db: Db = prisma
): Promise<void> {
  const existing = await db.forecast.findFirst({
    where: {
      userId,
      period: result.period,
      scenario: result.scenario,
      type: result.type,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    await db.forecast.update({
      where: { id: existing.id },
      data: {
        data: (await toJson(result)) as any,
        confidence: result.confidence ?? undefined,
        generatedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return;
  }

  await db.forecast.create({
    data: {
      userId,
      period: result.period,
      scenario: result.scenario,
      type: result.type,
      data: (await toJson(result)) as any,
      confidence: result.confidence ?? undefined,
    },
  });
}

export async function getLatestForecast(
  userId: string,
  period: ForecastPeriod,
  scenario: ForecastScenario,
  type: ForecastType,
  db: Db = prisma
): Promise<ForecastResult | null> {
  const row = await db.forecast.findFirst({
    where: { userId, period, scenario, type },
    orderBy: { createdAt: "desc" },
  });

  if (!row) return null;

  const data = row.data as any;
  return {
    id: row.id,
    period: data.period,
    scenario: data.scenario,
    type: data.type,
    points: data.points,
    summary: data.summary,
    risks: data.risks ?? [],
    confidence: row.confidence ?? 0,
    generatedAt: row.generatedAt.toISOString(),
  };
}

export async function listForecasts(userId: string, db: Db = prisma): Promise<ForecastResult[]> {
  const rows = await db.forecast.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => {
    const data = row.data as any;
    return {
      id: row.id,
      period: data.period,
      scenario: data.scenario,
      type: data.type,
      points: data.points,
      summary: data.summary,
      risks: data.risks ?? [],
      confidence: row.confidence ?? 0,
      generatedAt: row.generatedAt.toISOString(),
    };
  });
}

