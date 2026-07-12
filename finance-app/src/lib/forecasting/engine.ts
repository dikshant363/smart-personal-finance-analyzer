import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";
import { getCached, setCached, cacheKey } from "@/lib/analysis/cache";
import { calculateHealthScore } from "@/lib/score/engine";
import type { Db } from "./repository";
import type {
  ForecastInput,
  ForecastResult,
  ForecastPoint,
  ForecastPeriod,
  ForecastScenario,
  ForecastType,
  SimulationInput,
  SimulationResult,
} from "./types";
import { applyScenario, generateScenarioPoints } from "./scenarios";

function daysToMs(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

function parsePeriod(period: ForecastPeriod, customDays?: number): number {
  if (period === "custom") return customDays ?? 30;
  const map: Record<ForecastPeriod, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "6m": 180,
    "1y": 365,
    custom: customDays ?? 30,
  };
  return map[period];
}

function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function movingAverage(values: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    result.push(avg);
  }
  return result;
}

function computeVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
}

function buildPoints(
  baseValue: number,
  slope: number,
  days: number,
  variance: number,
  scenario: ForecastScenario
): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const today = new Date();
  const step = Math.max(1, Math.floor(days / 20));

  for (let i = 0; i <= days; i += step) {
    const projected = baseValue + slope * i;
    const adjusted = applyScenario(projected, variance, scenario);
    const date = new Date(today.getTime() + daysToMs(i));
    const spread = scenario === "expected" ? 0 : Math.sqrt(Math.max(0, variance)) * 0.75;

    points.push({
      date: date.toISOString().slice(0, 10),
      value: adjusted,
      lower: spread > 0 ? adjusted - spread : undefined,
      upper: spread > 0 ? adjusted + spread : undefined,
    });
  }

  if (points[points.length - 1]?.date !== new Date(today.getTime() + daysToMs(days)).toISOString().slice(0, 10)) {
    const lastDate = new Date(today.getTime() + daysToMs(days));
    const lastValue = applyScenario(baseValue + slope * days, variance, scenario);
    const spread = scenario === "expected" ? 0 : Math.sqrt(Math.max(0, variance)) * 0.75;
    points.push({
      date: lastDate.toISOString().slice(0, 10),
      value: lastValue,
      lower: spread > 0 ? lastValue - spread : undefined,
      upper: spread > 0 ? lastValue + spread : undefined,
    });
  }

  return points;
}

function computeConfidence(dataPoints: number, variance: number): number {
  if (dataPoints === 0) return 0;
  const dataScore = Math.min(1, dataPoints / 30);
  const varianceScore = variance === 0 ? 1 : Math.max(0, 1 - Math.min(1, variance / 100000));
  return Math.round((dataScore * 0.6 + varianceScore * 0.4) * 100) / 100;
}

async function fetchDailyCashFlow(userId: string, db: Db) {
  const now = new Date();
  const start = new Date(now.getTime() - daysToMs(90));

  const rows = await db.$queryRaw<
    { date: string; income: number; expense: number }[]
  >`
    SELECT
      date_trunc('day', "date")::date AS date,
      COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS expense
    FROM transactions
    WHERE "userId" = ${userId}
      AND "date" >= ${start}
    GROUP BY date_trunc('day', "date")::date
    ORDER BY date ASC
  `;

  return rows.map((r) => ({
    date: r.date,
    income: toNumber(r.income),
    expense: toNumber(r.expense),
    net: toNumber(r.income) - toNumber(r.expense),
  }));
}

async function fetchMonthlyTotals(userId: string, db: Db) {
  const now = new Date();
  const start = new Date(now.getTime() - daysToMs(365));

  const rows = await db.$queryRaw<
    { month: string; income: number; expense: number; savings: number }[]
  >`
    SELECT
      to_char("date", 'YYYY-MM') AS month,
      COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS expense
    FROM transactions
    WHERE "userId" = ${userId}
      AND "date" >= ${start}
    GROUP BY to_char("date", 'YYYY-MM')
    ORDER BY month ASC
  `;

  return rows.map((r) => ({
    month: r.month,
    income: toNumber(r.income),
    expense: toNumber(r.expense),
    savings: toNumber(r.income) - toNumber(r.expense),
  }));
}

async function fetchCategorySpending(userId: string, db: Db) {
  const now = new Date();
  const start = new Date(now.getTime() - daysToMs(90));

  const rows = await db.$queryRaw<
    { categoryId: string; categoryName: string; amount: number }[]
  >`SELECT c.id as categoryId, c.name as categoryName, COALESCE(SUM(t.amount), 0) as amount FROM transactions t LEFT JOIN categories c ON t.categoryId = c.id WHERE t.userId = ${userId} AND t.type = 'Expense' AND t.date >= ${start} GROUP BY c.id, c.name ORDER BY amount DESC`;

  return rows.map((r) => ({
    categoryId: r.categoryId,
    categoryName: r.categoryName,
    amount: toNumber(r.amount),
  }));
}

function forecastFromSeries(
  values: number[],
  days: number,
  scenario: ForecastScenario,
  risks: string[] = []
): ForecastResult {
  const ma = movingAverage(values, 3);
  const { slope, intercept } = linearRegression(ma);
  const variance = computeVariance(values);
  const confidence = computeConfidence(values.length, variance);
  const startValue = values[values.length - 1] ?? 0;
  const endValue = startValue + slope * days;
  const change = endValue - startValue;
  const changePercent = startValue !== 0 ? (change / startValue) * 100 : 0;

  const points = buildPoints(startValue, slope, days, variance, scenario);

  return {
    period: "30d",
    scenario,
    type: "cashflow",
    points,
    summary: {
      startValue,
      endValue,
      change,
      changePercent,
    },
    risks,
    confidence,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateForecast(
  input: ForecastInput,
  db: Db = prisma
): Promise<ForecastResult> {
  const cacheKeyStr = cacheKey(input.userId, `forecast:${input.period}:${input.scenario}:${input.type}`);
  const cached = getCached<ForecastResult>(cacheKeyStr);
  if (cached) return cached;

  const days = parsePeriod(input.period, input.customDays);
  const risks: string[] = [];

  let result: ForecastResult;

  switch (input.type) {
    case "cashflow":
    case "expense":
    case "income": {
      const monthly = await fetchMonthlyTotals(input.userId, db);
      const field = input.type === "expense" ? "expense" : input.type === "income" ? "income" : "savings";
      const values = monthly.map((m) => m[field]);
      const ma = movingAverage(values, 3);
      const { slope, intercept } = linearRegression(ma);
      const variance = computeVariance(values);
      const confidence = computeConfidence(values.length, variance);
      const startValue = values[values.length - 1] ?? 0;
      const endValue = startValue + slope * days / 30;
      const change = endValue - startValue;
      const changePercent = startValue !== 0 ? (change / startValue) * 100 : 0;
      const points = buildPoints(startValue, slope / 30, days, variance, input.scenario);

      result = {
        ...input,
        points,
        summary: { startValue, endValue, change, changePercent },
        risks,
        confidence,
        generatedAt: new Date().toISOString(),
      };
      break;
    }

    case "savings": {
      const monthly = await fetchMonthlyTotals(input.userId, db);
      const values = monthly.map((m) => m.savings);
      const ma = movingAverage(values, 3);
      const { slope, intercept } = linearRegression(ma);
      const variance = computeVariance(values);
      const confidence = computeConfidence(values.length, variance);
      const startValue = Math.max(0, values[values.length - 1] ?? 0);
      const endValue = Math.max(0, startValue + slope * days / 30);
      const change = endValue - startValue;
      const changePercent = startValue !== 0 ? (change / startValue) * 100 : 0;
      const points = buildPoints(startValue, slope / 30, days, variance, input.scenario);

      if (endValue <= 0 && startValue > 0) {
        risks.push("Savings trajectory is negative.");
      }

      result = {
        ...input,
        points,
        summary: { startValue, endValue, change, changePercent },
        risks,
        confidence,
        generatedAt: new Date().toISOString(),
      };
      break;
    }

    case "net_balance": {
      const monthly = await fetchMonthlyTotals(input.userId, db);
      const values = monthly.map((m) => m.savings);
      const ma = movingAverage(values, 3);
      const { slope, intercept } = linearRegression(ma);
      const variance = computeVariance(values);
      const confidence = computeConfidence(values.length, variance);
      const startValue = values[values.length - 1] ?? 0;
      const endValue = startValue + slope * days / 30;
      const change = endValue - startValue;
      const changePercent = startValue !== 0 ? (change / startValue) * 100 : 0;
      const points = buildPoints(startValue, slope / 30, days, variance, input.scenario);

      result = {
        ...input,
        points,
        summary: { startValue, endValue, change, changePercent },
        risks,
        confidence,
        generatedAt: new Date().toISOString(),
      };
      break;
    }

    case "budget": {
      const budgets = await db.budget.findMany({ where: { userId: input.userId } });
      const categories = await db.category.findMany({ where: { userId: input.userId } });
      const catMap = new Map(categories.map((c) => [c.id, c.name]));

      let totalBudget = 0;
      let totalSpent = 0;
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      for (const b of budgets) {
        totalBudget += toNumber(b.amount);
        const spent = await db.transaction.aggregate({
          _sum: { amount: true },
          where: {
            userId: input.userId,
            type: "Expense",
            date: { gte: monthStart },
            ...(b.categoryId ? { categoryId: b.categoryId } : {}),
          },
        });
        totalSpent += toNumber(spent._sum.amount);
      }

      const remaining = totalBudget - totalSpent;
      const dailyAverage = totalSpent / Math.max(1, (now.getTime() - monthStart.getTime()) / 86400000);
      const daysLeft = Math.max(0, 30 - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getDate());
      const projectedSpend = dailyAverage * daysLeft;
      const endValue = remaining - projectedSpend;
      const startValue = remaining;
      const change = endValue - startValue;
      const changePercent = startValue !== 0 ? (change / startValue) * 100 : 0;

      const points = buildPoints(startValue, (endValue - startValue) / days, days, Math.abs(change), input.scenario);

      if (remaining < 0) risks.push("Already over budget this month.");
      if (projectedSpend > remaining) risks.push("Projected to exceed budget by month end.");

      result = {
        ...input,
        points,
        summary: { startValue, endValue, change, changePercent },
        risks,
        confidence: 0.85,
        generatedAt: new Date().toISOString(),
      };
      break;
    }

    case "category": {
      const cats = await fetchCategorySpending(input.userId, db);
      const top = cats[0];
      const startValue = top?.amount ?? 0;
      const { slope } = linearRegression([startValue, startValue * 1.1, startValue]);
      const variance = computeVariance([startValue, startValue * 1.05, startValue * 0.95]);
      const endValue = startValue + slope * days / 30;
      const change = endValue - startValue;
      const changePercent = startValue !== 0 ? (change / startValue) * 100 : 0;
      const points = buildPoints(startValue, slope / 30, days, variance, input.scenario);

      result = {
        ...input,
        points,
        summary: { startValue, endValue, change, changePercent },
        risks: top ? [`Top spending category: ${top.categoryName}`] : [],
        confidence: 0.75,
        generatedAt: new Date().toISOString(),
      };
      break;
    }

    case "emergency_fund": {
      const score = await calculateHealthScore(input.userId, db);
      const ef = score.dimensions.find((d) => d.key === "emergency_fund");
      const startValue = ef?.current ?? 0;
      const monthly = await fetchMonthlyTotals(input.userId, db);
      const savings = monthly.map((m) => m.savings);
      const ma = movingAverage(savings, 3);
      const { slope } = linearRegression(ma);
      const endValue = Math.max(0, startValue + (slope / 30) * days);
      const change = endValue - startValue;
      const changePercent = startValue !== 0 ? (change / startValue) * 100 : 0;
      const variance = computeVariance(savings);
      const points = buildPoints(startValue, (endValue - startValue) / days, days, variance, input.scenario);

      if (ef && ef.score < 50) risks.push("Emergency fund is below 50% of target.");

      result = {
        ...input,
        points,
        summary: { startValue, endValue, change, changePercent },
        risks,
        confidence: 0.8,
        generatedAt: new Date().toISOString(),
      };
      break;
    }

    case "health_score": {
      const score = await calculateHealthScore(input.userId, db);
      const startValue = score.score;
      const monthly = await fetchMonthlyTotals(input.userId, db);
      const savings = monthly.map((m) => m.savings);
      const ma = movingAverage(savings, 3);
      const { slope } = linearRegression(ma);
      const projectedChange = (slope / 30) * days * 0.5;
      const endValue = Math.min(100, Math.max(0, startValue + projectedChange));
      const change = endValue - startValue;
      const changePercent = startValue !== 0 ? (change / startValue) * 100 : 0;
      const variance = computeVariance(savings);
      const points = buildPoints(startValue, projectedChange / days, days, variance, input.scenario);

      result = {
        ...input,
        points,
        summary: { startValue, endValue, change, changePercent },
        risks,
        confidence: 0.7,
        generatedAt: new Date().toISOString(),
      };
      break;
    }

    case "goal": {
      const goals = await db.transaction.findMany({
        where: { userId: input.userId },
        select: { amount: true },
      });
      const totalGoals = goals.reduce((sum, g) => sum + toNumber(g.amount), 0);
      const monthly = await fetchMonthlyTotals(input.userId, db);
      const savings = monthly.map((m) => m.savings);
      const ma = movingAverage(savings, 3);
      const { slope } = linearRegression(ma);
      const startValue = totalGoals;
      const endValue = Math.max(0, totalGoals - (slope / 30) * days);
      const change = endValue - startValue;
      const changePercent = startValue !== 0 ? (change / startValue) * 100 : 0;
      const variance = computeVariance(savings);
      const points = buildPoints(startValue, (endValue - startValue) / days, days, variance, input.scenario);

      result = {
        ...input,
        points,
        summary: { startValue, endValue, change, changePercent },
        risks,
        confidence: 0.7,
        generatedAt: new Date().toISOString(),
      };
      break;
    }

    default:
      result = {
        ...input,
        points: [],
        summary: { startValue: 0, endValue: 0, change: 0, changePercent: 0 },
        risks: ["Unknown forecast type."],
        confidence: 0,
        generatedAt: new Date().toISOString(),
      };
  }

  setCached(cacheKeyStr, result);
  return result;
}

export async function runSimulation(
  input: SimulationInput,
  db: Db = prisma
): Promise<SimulationResult> {
  const baseline = await generateForecast(
    {
      userId: input.userId,
      period: input.period,
      scenario: "expected",
      type: "cashflow",
    },
    db
  );

  const adj = input.adjustments;
  const simInput: ForecastInput = {
    userId: input.userId,
    period: input.period,
    scenario: "expected",
    type: "cashflow",
  };

  const simulated = await generateForecast(
    {
      ...simInput,
      scenario: "best",
    },
    db
  );

  const baselineSavings = baseline.points[baseline.points.length - 1]?.value ?? 0;
  const simulatedSavings = simulated.points[simulated.points.length - 1]?.value ?? 0;
  const baselineScore = baseline.summary.endValue;
  const simulatedScore = simulated.summary.endValue;

  const cashflowDelta = baseline.summary.endValue - simulated.summary.endValue;
  const savingsDelta = baselineSavings - simulatedSavings;
  const scoreDelta = simulatedScore - baselineScore;

  return {
    baseline,
    simulated,
    comparison: {
      cashflowDelta,
      savingsDelta,
      scoreDelta,
    },
  };
}

export async function detectRisks(
  userId: string,
  db: Db = prisma
): Promise<
  { id: string; title: string; severity: string; detail: string; evidence: string }[]
> {
  const risks: { id: string; title: string; severity: string; detail: string; evidence: string }[] = [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [overBudget, categories, budgets] =
    await Promise.all([
      db.transaction.findMany({
        where: { userId, type: "Expense", date: { gte: monthStart } },
        include: { category: true },
      }),
      db.category.findMany({ where: { userId, isSystem: false } }),
      db.budget.findMany({ where: { userId } }),
    ]);

  const catSpend = new Map<string, number>();
  for (const t of overBudget) {
    const key = t.categoryId ?? "__uncategorized__";
    catSpend.set(key, (catSpend.get(key) ?? 0) + toNumber(t.amount));
  }

  for (const b of budgets) {
    const spent = catSpend.get(b.categoryId ?? "__uncategorized__") ?? 0;
    const budgetAmount = toNumber(b.amount);
    if (budgetAmount > 0 && spent > budgetAmount) {
      risks.push({
        id: `over_budget_${b.id}`,
        title: "Over budget",
        severity: "high",
        detail: `${b.name} is over budget.`,
        evidence: `Spent ${spent.toFixed(2)} of ${budgetAmount.toFixed(2)} budget.`,
      });
    }
  }

  const score = await calculateHealthScore(userId, db).catch(() => null);
  if (score) {
    const ef = score.dimensions.find((d) => d.key === "emergency_fund");
    if (ef && ef.score < 50) {
      risks.push({
        id: "low_emergency_fund",
        title: "Low emergency fund",
        severity: "high",
        detail: "Emergency fund coverage is below 50%.",
        evidence: `Score: ${ef.score}, current: ${ef.currentLabel}.`,
      });
    }
  }

  const monthly = await fetchMonthlyTotals(userId, db);
  if (monthly.length >= 2) {
    const recent = monthly.slice(-2);
    if (recent.every((m) => m.savings < 0)) {
      risks.push({
        id: "negative_cashflow_trend",
        title: "Negative cash flow trend",
        severity: "medium",
        detail: "Recent months show negative savings.",
        evidence: `Recent months: ${recent.map((m) => m.savings.toFixed(2)).join(", ")}.`,
      });
    }
  }

  const largeTxs = await db.transaction.findMany({
    where: { userId, type: "Expense", date: { gte: new Date(now.getTime() - daysToMs(30)) } },
    orderBy: { amount: "desc" },
    take: 5,
  });

  if (largeTxs.length > 0) {
    const avg = largeTxs.reduce((s, t) => s + toNumber(t.amount), 0) / largeTxs.length;
    const outlier = largeTxs.find((t) => toNumber(t.amount) > avg * 3);
    if (outlier) {
      risks.push({
        id: `large_purchase_${outlier.id}`,
        title: "Unusually large purchase",
        severity: "medium",
        detail: "A transaction is significantly larger than average.",
        evidence: `${toNumber(outlier.amount).toFixed(2)} on ${outlier.date.toISOString().slice(0, 10)}.`,
      });
    }
  }

  const catGrowth = new Map<string, Array<{ month: string; amount: number }>>();
  for (const t of overBudget) {
    const month = t.date.toISOString().slice(0, 7);
    const key = t.categoryId ?? "__uncategorized__";
    if (!catGrowth.has(key)) catGrowth.set(key, []);
    const arr = catGrowth.get(key)!;
    const idx = arr.findIndex((v) => v.month === month);
    if (idx >= 0) {
      arr[idx].amount += toNumber(t.amount);
    } else {
      arr.push({ month, amount: toNumber(t.amount) });
    }
  }

  for (const [, arr] of catGrowth) {
    if (arr.length >= 2) {
      arr.sort((a, b) => a.month.localeCompare(b.month));
      const growth = (arr[arr.length - 1].amount - arr[0].amount) / Math.max(1, arr[0].amount);
      if (growth > 0.5) {
        const catName = overBudget.find((t) => t.categoryId)?.category?.name ?? "Unknown category";
        risks.push({
          id: `category_growth_${catName}`,
          title: "Unusual category growth",
          severity: "medium",
          detail: `${catName} spending grew ${(growth * 100).toFixed(0)}% recently.`,
          evidence: `From ${arr[0].amount.toFixed(2)} to ${arr[arr.length - 1].amount.toFixed(2)}.`,
        });
      }
    }
  }

  return risks;
}
