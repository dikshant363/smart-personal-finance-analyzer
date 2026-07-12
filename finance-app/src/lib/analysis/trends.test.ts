import { describe, it, expect } from "vitest";
import { buildTrends } from "./trends";

function makeDb() {
  const now = new Date();
  const rows = [
    { amount: 100, date: new Date(now.getFullYear(), now.getMonth() - 0, 5), type: "Expense", categoryId: "c1" },
    { amount: 200, date: new Date(now.getFullYear(), now.getMonth() - 1, 8), type: "Expense", categoryId: "c2" },
    { amount: 150, date: new Date(now.getFullYear(), now.getMonth() - 2, 12), type: "Expense", categoryId: "c1" },
    { amount: 500, date: new Date(now.getFullYear(), now.getMonth(), 3), type: "Income", categoryId: null },
    { amount: 480, date: new Date(now.getFullYear(), now.getMonth() - 1, 4), type: "Income", categoryId: null },
  ];
  const cats = [
    { id: "c1", name: "Groceries" },
    { id: "c2", name: "Dining" },
  ];
  return {
    transaction: {
      findMany: async () => rows,
    },
    category: {
      findMany: async () => cats,
    },
  } as any;
}

function expectSeries(series: { name: string; points: { period: string; label: string; value: number }[] }) {
  expect(Array.isArray(series.points)).toBe(true);
  for (const p of series.points) {
    expect(Number.isFinite(p.value)).toBe(true);
  }
}

describe("buildTrends", () => {
  it("returns monthly, yearly, and incomeVsExpense series with finite values", async () => {
    const db = makeDb();
    const trends = await buildTrends("user-1", db);

    expectSeries(trends.monthly);
    expectSeries(trends.yearly);
    expectSeries(trends.incomeVsExpense.income);
    expectSeries(trends.incomeVsExpense.expense);
  });

  it("includes a category series for top categories", async () => {
    const db = makeDb();
    const trends = await buildTrends("user-1", db);
    expect(Array.isArray(trends.category)).toBe(true);
    expect(trends.category.length).toBeGreaterThan(0);
  });
});
