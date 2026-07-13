import { prisma } from "@/lib/prisma";
import { toNumber, formatMoney } from "@/lib/currency";
import type { Insight, Alert } from "./types";

export type Db = typeof prisma;

type AmountInput = Parameters<typeof toNumber>[0];

interface RawExpense {
  amount: AmountInput;
  category: { name: string | null } | null;
  date: Date;
}

interface Expense {
  amount: number;
  name: string;
  date: Date;
}

function toExpenses(rows: RawExpense[]): Expense[] {
  return rows.map((r) => ({
    amount: toNumber(r.amount),
    name: r.category?.name ?? "Uncategorized",
    date: r.date,
  }));
}

function groupByCategory(rows: Expense[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const r of rows) {
    totals.set(r.name, (totals.get(r.name) ?? 0) + r.amount);
  }
  return totals;
}

function sumAmounts(rows: Expense[]): number {
  return rows.reduce((acc, r) => acc + r.amount, 0);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function pctChange(prev: number, cur: number): number {
  if (prev <= 0) return 0;
  return ((cur - prev) / prev) * 100;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export async function computeInsights(
  userId: string,
  db: Db = prisma,
  currency = "USD"
): Promise<{ insights: Insight[]; alerts: Alert[] }> {
  const now = new Date();
  const curStart = startOfMonth(now);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
  const prevEnd = new Date(curStart.getTime() - 1);
  const lyStart = new Date(now.getFullYear() - 1, now.getMonth(), 1, 0, 0, 0, 0);
  const lyEnd = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1, 0, 0, 0, 0);
  lyEnd.setMilliseconds(lyEnd.getMilliseconds() - 1);

  const [curRaw, prevRaw, lyRaw, budgets] = await Promise.all([
    db.transaction.findMany({
      where: { userId, type: "Expense", date: { gte: curStart, lte: now } },
      include: { category: { select: { name: true } } },
    }),
    db.transaction.findMany({
      where: { userId, type: "Expense", date: { gte: prevStart, lte: prevEnd } },
      include: { category: { select: { name: true } } },
    }),
    db.transaction.findMany({
      where: { userId, type: "Expense", date: { gte: lyStart, lte: lyEnd } },
      include: { category: { select: { name: true } } },
    }),
    db.budget.findMany({ where: { userId } }),
  ]);

  const curExpenses = toExpenses(curRaw as RawExpense[]);
  const prevExpenses = toExpenses(prevRaw as RawExpense[]);
  const lyExpenses = toExpenses(lyRaw as RawExpense[]);

  const curTotals = groupByCategory(curExpenses);
  const prevTotals = groupByCategory(prevExpenses);
  const lyTotals = groupByCategory(lyExpenses);

  const totalExpense = sumAmounts(curExpenses);
  const prevTotalExpense = sumAmounts(prevExpenses);

  const insights: Insight[] = [];
  const alerts: Alert[] = [];

  const topCategories = [...curTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (topCategories.length > 0 && totalExpense > 0) {
    const [topName, topAmount] = topCategories[0];
    const share = (topAmount / totalExpense) * 100;
    const list = topCategories
      .map(([name, amt]) => `${name} (${formatMoney(amt, currency)}, ${((amt / totalExpense) * 100).toFixed(0)}%)`)
      .join(", ");
    insights.push({
      id: "top-categories",
      title: "Top spending categories",
      summary: `${topName} leads your spending at ${share.toFixed(0)}% of outflows.`,
      explanation: `Your three largest categories this month account for the bulk of spending. Tracking these keeps the rest of your budget on track.`,
      evidence: `Top: ${list}. Total expenses ${formatMoney(totalExpense, currency)}.`,
      confidence: "very_high",
      impact: "medium",
      priority: "low",
      suggestedAction: `Review ${topName} for discretionary cuts and set a soft cap for the month.`,
      category: "category",
      metric: topAmount,
    });
  }

  let maxIncrease: { name: string; prev: number; cur: number } | null = null;
  let maxDecrease: { name: string; prev: number; cur: number } | null = null;
  for (const [name, cur] of curTotals) {
    const prev = prevTotals.get(name) ?? 0;
    const delta = cur - prev;
    const threshold = Math.max(prev * 0.05, 50);
    if (delta > threshold) {
      if (!maxIncrease || delta > maxIncrease.cur - maxIncrease.prev) {
        maxIncrease = { name, prev, cur };
      }
    } else if (delta < -threshold) {
      if (!maxDecrease || delta < maxDecrease.cur - maxDecrease.prev) {
        maxDecrease = { name, prev, cur };
      }
    }
  }

  if (maxIncrease) {
    const { name, prev, cur } = maxIncrease;
    const pct = pctChange(prev, cur);
    const big = pct > 25 || cur > prev * 1.25;
    insights.push({
      id: `increase-${name}`,
      title: `${name} spending increased`,
      summary: `${name} rose ${pct.toFixed(0)}% versus last month.`,
explanation: `${name} spending moved from ${formatMoney(prev, currency)} to ${formatMoney(cur, currency)} (${pct.toFixed(0)}%). This is the largest category increase this month.`,
        evidence: `${formatMoney(prev, currency)} → ${formatMoney(cur, currency)} (+${pct.toFixed(0)}%)`,
      confidence: "high",
      impact: big ? "high" : "medium",
      priority: big ? "high" : "medium",
      suggestedAction: `Audit recent ${name} purchases and pause non-essential spending in this category.`,
      category: "trend",
      metric: cur,
    });
  }

  if (maxDecrease) {
    const { name, prev, cur } = maxDecrease;
    const pct = pctChange(prev, cur);
    insights.push({
      id: `decrease-${name}`,
      title: `${name} spending decreased`,
      summary: `${name} fell ${Math.abs(pct).toFixed(0)}% versus last month.`,
      explanation: `${name} spending dropped from ${formatMoney(prev, currency)} to ${formatMoney(cur, currency)} (${pct.toFixed(0)}%). Nice progress on controlling this category.`,
      evidence: `${formatMoney(prev, currency)} → ${formatMoney(cur, currency)} (${pct.toFixed(0)}%)`,
      confidence: "high",
      impact: "low",
      priority: "low",
      suggestedAction: `Keep it up — lock in the new ${name} habit with a recurring savings transfer.`,
      category: "trend",
      metric: cur,
    });
  }

  const recurringCategories = [...curTotals.keys()].filter((name) => prevTotals.has(name));
  const recurring = recurringCategories.reduce((acc, name) => acc + (curTotals.get(name) ?? 0), 0);
  if (recurring > 0) {
    const overReliant = totalExpense > 0 && recurring > 0.6 * totalExpense;
    insights.push({
      id: "recurring",
      title: "Recurring commitments estimate",
      summary: `About ${formatMoney(recurring, currency)}/mo flows to categories you also paid last month.`,
      explanation: `These categories appeared in both this and last month, suggesting fixed or recurring obligations.`,
      evidence: `${formatMoney(recurring, currency)}/mo${totalExpense > 0 ? ` (${((recurring / totalExpense) * 100).toFixed(0)}% of spend)` : ""}`,
      confidence: "high",
      impact: overReliant ? "high" : "medium",
      priority: overReliant ? "medium" : "low",
      suggestedAction: overReliant
        ? "Your spending is heavily committed — build a buffer before taking on new fixed costs."
        : "Account for these as fixed in your monthly plan and protect the remainder.",
      category: "cashflow",
      metric: recurring,
    });
  }

  const weekdayTotal = curExpenses
    .filter((r) => r.date.getDay() !== 0 && r.date.getDay() !== 6)
    .reduce((acc, r) => acc + r.amount, 0);
  const weekendTotal = curExpenses
    .filter((r) => r.date.getDay() === 0 || r.date.getDay() === 6)
    .reduce((acc, r) => acc + r.amount, 0);
  if (weekendTotal > weekdayTotal * 0.5) {
    insights.push({
      id: "weekend",
      title: "Weekend spending is high",
      summary: `Weekend outflows are ${((weekendTotal / (weekdayTotal || 1)) * 100).toFixed(0)}% of weekday spending.`,
      explanation: `You spend notably more on weekends than weekdays, a common leak point for discretionary purchases.`,
      evidence: `Weekend ${formatMoney(weekendTotal, currency)} vs weekday ${formatMoney(weekdayTotal, currency)}`,
      confidence: "medium",
      impact: "medium",
      priority: "low",
      suggestedAction: "Plan weekend activities with a set budget to curb impulse spending.",
      category: "spending",
      metric: weekendTotal,
    });
  } else if (weekendTotal < weekdayTotal * 0.2 && totalExpense > 0) {
    insights.push({
      id: "weekend",
      title: "Weekend spending is well controlled",
      summary: `Weekend outflows are only ${((weekendTotal / (weekdayTotal || 1)) * 100).toFixed(0)}% of weekday spending.`,
      explanation: `You keep weekend discretionary spending low relative to weekdays.`,
      evidence: `Weekend ${formatMoney(weekendTotal, currency)} vs weekday ${formatMoney(weekdayTotal, currency)}`,
      confidence: "medium",
      impact: "low",
      priority: "low",
      suggestedAction: "Maintain the discipline; consider redirecting weekend savings to a goal.",
      category: "spending",
      metric: weekendTotal,
    });
  }

  for (const [name, cur] of curTotals) {
    const prev = prevTotals.get(name) ?? 0;
    const ly = lyTotals.get(name) ?? 0;
    if (ly > 0 && prev > 0) {
      const yoy = pctChange(ly, cur);
      insights.push({
        id: `yoy-${name}`,
        title: `Year-over-year: ${name}`,
        summary: `${name} is ${yoy >= 0 ? "up" : "down"} ${Math.abs(yoy).toFixed(0)}% vs a year ago.`,
        explanation: `${name} spending is ${formatMoney(cur, currency)} now versus ${formatMoney(ly, currency)} in the same month last year (${yoy.toFixed(0)}%).`,
        evidence: `${formatMoney(ly, currency)} → ${formatMoney(cur, currency)} (${yoy.toFixed(0)}% YoY)`,
        confidence: "medium",
        impact: "low",
        priority: "low",
        suggestedAction: yoy >= 0
          ? `Check whether the higher ${name} spend is a one-off or a new baseline.`
          : `The lower ${name} spend vs last year is a good sign — keep it going.`,
        category: "trend",
        metric: cur,
      });
    }
  }

  if (curExpenses.length > 0) {
    const sortedAmounts = curExpenses.map((r) => r.amount).sort((a, b) => b - a);
    const maxSingle = sortedAmounts[0];
    const med = median(curExpenses.map((r) => r.amount));
    if (maxSingle > 3 * med && maxSingle > 100) {
      alerts.push({
        id: "large-purchase",
        title: "Unusually large purchase",
        severity: "high",
        detail: "A single transaction is far above your typical purchase size.",
        evidence: `Largest ${formatMoney(maxSingle, currency)} vs median ${formatMoney(med, currency)}`,
      });
    }
  }

  if (prevTotalExpense > 0 && totalExpense > 0) {
    const daysElapsed = Math.max(1, Math.ceil((now.getTime() - curStart.getTime()) / (24 * 60 * 60 * 1000)));
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const runRate = (totalExpense / daysElapsed) * daysInMonth;
    if (runRate > 1.5 * prevTotalExpense) {
      alerts.push({
        id: "spending-spike",
        title: "Spending spike this month",
        severity: "medium",
        detail: "Your projected month-end spend is well above last month's total.",
        evidence: `Run-rate ${formatMoney(runRate, currency)} vs last month ${formatMoney(prevTotalExpense, currency)}`,
      });
    }
  }

  for (const budget of budgets) {
    const amount = toNumber(budget.amount);
    const spentAgg = await db.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        type: "Expense",
        date: { gte: curStart, lte: now },
        ...(budget.categoryId ? { categoryId: budget.categoryId } : {}),
      },
    });
    const spent = toNumber(spentAgg._sum.amount);
    if (spent > amount) {
      alerts.push({
        id: `over-budget-${budget.id}`,
        title: `Over budget: ${budget.name}`,
        severity: spent > amount * 1.25 ? "high" : "medium",
        detail: "You have exceeded this budget for the current month.",
        evidence: `${formatMoney(spent, currency)} / ${formatMoney(amount, currency)}`,
      });
    }
  }

  for (const [name, cur] of curTotals) {
    const prev = prevTotals.get(name) ?? 0;
    if (cur > 2 * prev && cur > 200) {
      alerts.push({
        id: `unusual-growth-${name}`,
        title: `Unusual growth in ${name}`,
        severity: "medium",
        detail: "A category grew sharply compared with last month.",
        evidence: `${formatMoney(prev, currency)} → ${formatMoney(cur, currency)}`,
      });
    }
  }

  return { insights, alerts };
}
