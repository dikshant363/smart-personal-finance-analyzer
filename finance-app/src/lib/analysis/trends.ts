import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";
import type { TrendPoint, Series, AnalysisTrends } from "./types";

export type Db = typeof prisma;

export async function buildTrends(userId: string, db: Db = prisma): Promise<AnalysisTrends> {
  const now = new Date();
  const start365 = new Date(now.getTime() - 365 * 86400000);
  const recent = await db.transaction.findMany({
    where: { userId, date: { gte: start365 } },
    select: { amount: true, date: true, type: true, categoryId: true },
  });
  const rows = recent.map((t) => ({
    amount: toNumber(t.amount),
    date: t.date,
    type: t.type,
    categoryId: t.categoryId,
  }));
  const cats = await db.category.findMany({ where: { userId }, select: { id: true, name: true } });
  const catName = new Map(cats.map((c) => [c.id, c.name]));

  const sum = (arr: { amount: number }[]) => arr.reduce((a, b) => a + b.amount, 0);

  const dailyPts: TrendPoint[] = bucket(
    rows.filter((r) => r.type === "Expense" && daysAgo(r.date) <= 30),
    (r) => r.date.toISOString().slice(0, 10),
    (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );
  const weeklyPts = bucket(
    rows.filter((r) => r.type === "Expense" && daysAgo(r.date) <= 84),
    (r) => weekKey(r.date),
    (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );
  const monthlyPts = bucket(
    rows.filter((r) => r.type === "Expense"),
    (r) => r.date.toISOString().slice(0, 7),
    (d) => d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  );
  const quarterlyPts = bucket(
    rows.filter((r) => r.type === "Expense"),
    (r) => `${r.date.getFullYear()}-Q${Math.floor(r.date.getMonth() / 3) + 1}`,
    (d) => `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`
  );
  const yearlyPts = bucket(
    rows.filter((r) => r.type === "Expense"),
    (r) => String(r.date.getFullYear()),
    (d) => String(d.getFullYear())
  );

  const monthlyIncome = bucket(rows.filter((r) => r.type === "Income"), (r) => r.date.toISOString().slice(0, 7), (d) => d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }));
  const monthlyExpense = monthlyPts;
  const savingsPts = mergeSeries(monthlyIncome, monthlyExpense, (i, e) => i - e);

  // top 3 categories this month
  const curStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const curExpense = rows.filter((r) => r.type === "Expense" && r.date >= curStart);
  const byCat = new Map<string, number>();
  for (const r of curExpense) byCat.set(r.categoryId ?? "uncat", (byCat.get(r.categoryId ?? "uncat") ?? 0) + r.amount);
  const top3 = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const category = top3.map(([cid, _]) => {
    const name = catName.get(cid) ?? "Uncategorized";
    const pts = bucket(
      rows.filter((r) => r.type === "Expense" && r.categoryId === cid && daysAgo(r.date) <= 180),
      (r) => r.date.toISOString().slice(0, 7),
      (d) => d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    );
    return { name, series: { name, points: pts } as Series };
  });

  return {
    daily: { name: "Daily spending", points: dailyPts },
    weekly: { name: "Weekly spending", points: weeklyPts },
    monthly: { name: "Monthly spending", points: monthlyPts },
    quarterly: { name: "Quarterly spending", points: quarterlyPts },
    yearly: { name: "Yearly spending", points: yearlyPts },
    incomeVsExpense: { income: { name: "Income", points: monthlyIncome }, expense: { name: "Expense", points: monthlyExpense } },
    savings: { name: "Savings", points: savingsPts },
    cashflow: { name: "Cash flow", points: savingsPts },
    category,
  };
}

function daysAgo(d: Date): number {
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}
function weekKey(d: Date): string {
  const dt = new Date(d);
  const day = (dt.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - day);
  return dt.toISOString().slice(0, 10);
}
function bucket(
  rows: { amount: number; date: Date; type: string; categoryId: string | null }[],
  keyFn: (r: { amount: number; date: Date; type: string; categoryId: string | null }) => string,
  labelFn: (d: Date) => string
): TrendPoint[] {
  const m = new Map<string, number>();
  for (const r of rows) m.set(keyFn(r), (m.get(keyFn(r)) ?? 0) + r.amount);
  return [...m.entries()]
    .map(([period, value]) => ({ period, label: labelFn(new Date(period.length >= 10 && period[7] === "-" ? period : period + "-01")), value: Math.round(value * 100) / 100 }))
    .sort((a, b) => a.period.localeCompare(b.period));
}
function mergeSeries(a: TrendPoint[], b: TrendPoint[], fn: (x: number, y: number) => number): TrendPoint[] {
  const bm = new Map(b.map((p) => [p.period, p.value]));
  return a.map((p) => ({ period: p.period, label: p.label, value: Math.round(fn(p.value, bm.get(p.period) ?? 0) * 100) / 100 }));
}
