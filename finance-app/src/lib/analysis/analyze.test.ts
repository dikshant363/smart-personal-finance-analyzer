import { describe, it, expect } from "vitest";
import { analyzeSpending } from "./analyze";

function makeDb() {
  const now = new Date();
  const expenses = [
    { amount: 400, category: { name: "Groceries" }, date: now, type: "Expense", categoryId: "c1" },
    { amount: 300, category: { name: "Dining" }, date: now, type: "Expense", categoryId: "c2" },
    { amount: 50, category: { name: "Dining" }, date: now, type: "Expense", categoryId: "c2" },
    { amount: 500, category: { name: "Income" }, date: now, type: "Income", categoryId: null },
  ];
  const budgets = [{ id: "b1", name: "Groceries", amount: 100, categoryId: "c1" }];
  const rows = expenses;
  const cats = [
    { id: "c1", name: "Groceries" },
    { id: "c2", name: "Dining" },
  ];
  return {
    transaction: {
      findMany: async () => expenses,
      aggregate: async () => ({ _sum: { amount: 520 } }),
    },
    budget: {
      findMany: async () => budgets,
    },
    category: {
      findMany: async () => cats,
    },
  } as any;
}

describe("analyzeSpending", () => {
  it("returns an AnalysisResult with insights, alerts and trends", async () => {
    const db = makeDb();
    const result = await analyzeSpending("user-1", db);
    expect(Array.isArray(result.insights)).toBe(true);
    expect(Array.isArray(result.alerts)).toBe(true);
    expect(result.trends).toBeDefined();
    expect(result.generatedAt).toBeDefined();
  });

  it("returns the same cached object (same generatedAt) on a second call", async () => {
    const db = makeDb();
    const first = await analyzeSpending("user-1", db);
    const second = await analyzeSpending("user-1", db);
    expect(first.trends.monthly).toBeDefined();
    expect(second.trends.monthly).toBeDefined();
    expect(first.generatedAt).toBe(second.generatedAt);
  });
});
