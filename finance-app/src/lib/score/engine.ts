import { prisma } from "@/lib/prisma";
import { toNumber, formatMoney } from "@/lib/currency";
import type { ScoreDimension, ScoreInputs, ScoreResult, ScoreTrendPoint } from "./types";
import { scoreFromInputs, bandFor, buildRecommendations, buildExplanations } from "./dimensions";
import { getPreviousMonthDimensions, getHistory } from "./store";

export type Db = typeof prisma;

export async function calculateHealthScore(
  userId: string,
  db: Db = prisma,
  opts?: { start?: Date; end?: Date }
): Promise<ScoreResult> {
  const now = new Date();
  const start = opts?.start ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const end = opts?.end ?? now;

  const daysInWindow = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);

  const [
    totals,
    incomeTx,
    expGrp,
    catsList,
    budgetsList,
    dates,
    eAgg,
    iAggSame,
    profile,
  ] = await Promise.all([
    db.transaction.groupBy({
      by: ["type"],
      where: { userId, date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    db.transaction.findMany({
      where: { userId, type: "Income", date: { gte: start, lte: end } },
      select: { amount: true },
    }),
    db.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "Expense", date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    db.category.findMany({ where: { userId }, select: { id: true, name: true } }),
    db.budget.findMany({ where: { userId } }),
    db.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      select: { date: true },
    }),
    db.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        type: "Expense",
        date: {
          gte: new Date(start.getFullYear(), start.getMonth() - 2, 1),
          lte: end,
        },
      },
    }),
    db.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        type: "Income",
        date: {
          gte: new Date(start.getFullYear(), start.getMonth() - 2, 1),
          lte: end,
        },
      },
    }),
    db.profile.findUnique({ where: { userId } }),
  ]);

  const income = toNumber(totals.find((t) => t.type === "Income")?._sum.amount);
  const expense = toNumber(totals.find((t) => t.type === "Expense")?._sum.amount);
  const net = income - expense;

  const incomeAmounts = incomeTx.map((t) => toNumber(t.amount));
  const incomeTxCount = incomeTx.length;

  const catMap = new Map(catsList.map((c) => [c.id, c.name]));
  const expenseByCategory = expGrp.map((g) => ({
    name: catMap.get(g.categoryId ?? "") ?? "Uncategorized",
    amount: toNumber(g._sum.amount),
  }));

  const budgetItems = await Promise.all(
    budgetsList.map(async (b) => {
      const agg = await db.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          type: "Expense",
          date: { gte: start, lte: end },
          ...(b.categoryId ? { categoryId: b.categoryId } : {}),
        },
      });
      return { amount: toNumber(b.amount), spent: toNumber(agg._sum.amount) };
    })
  );

  const activeDays = new Set(dates.map((d) => d.date.toISOString().slice(0, 10))).size;

  const savingsLast3Months = toNumber(iAggSame._sum.amount) - toNumber(eAgg._sum.amount);
  const expenseLast3Months = toNumber(eAgg._sum.amount);
  const avgMonthlyExpense = expenseLast3Months / 3;

  const currency = profile?.currency ?? "USD";

  const inputs: ScoreInputs = {
    income,
    expense,
    net,
    savingsLast3Months,
    expenseLast3Months,
    avgMonthlyExpense,
    incomeTxCount,
    incomeAmounts,
    expenseByCategory,
    budgetItems,
    activeDays,
    daysInWindow,
    currency,
  };

  const { dimensions, total } = scoreFromInputs(inputs);

  const previous = await getPreviousMonthDimensions(userId, db);

  const explanations = buildExplanations(dimensions, previous);
  const recommendations = buildRecommendations(dimensions);
  const estimatedPotentialGain = recommendations.reduce((sum, rec) => sum + rec.potentialGain, 0);

  const month = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;

  return {
    score: total,
    band: bandFor(total),
    month,
    dimensions,
    recommendations,
    explanations,
    estimatedPotentialGain,
    currency,
    calculatedAt: new Date().toISOString(),
  };
}

export async function getScoreTrend(
  userId: string,
  range: "weekly" | "monthly" | "yearly" = "monthly",
  db: Db = prisma
): Promise<ScoreTrendPoint[]> {
  if (range === "monthly") {
    return getHistory(userId, db);
  }

  if (range === "yearly") {
    const history = await getHistory(userId, db);
    const map = new Map<string, number[]>();
    for (const point of history) {
      const year = point.period.slice(0, 4);
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(point.score);
    }
    return Array.from(map.entries())
      .map(([period, scores]) => ({
        period,
        score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  const points: ScoreTrendPoint[] = [];
  const now = Date.now();
  for (let i = 0; i < 8; i++) {
    const we = new Date(now - i * 7 * 86400000);
    const ws = new Date(we.getTime() - 7 * 86400000);
    const score = (await calculateHealthScore(userId, db, { start: ws, end: we })).score;
    points.push({ period: ws.toISOString().slice(0, 10), score });
  }
  points.reverse();
  return points;
}
