import { describe, it, expect } from "vitest";
import { computeInsights } from "./insights";

function makeDb() {
  const now = new Date();
  const expenses = [
    { amount: 400, category: { name: "Groceries" }, date: now },
    { amount: 300, category: { name: "Dining" }, date: now },
    { amount: 50, category: { name: "Dining" }, date: now },
    { amount: 120, category: { name: "Groceries" }, date: new Date(now.getFullYear(), now.getMonth() - 1, 15) },
  ];
  const budgets = [
    { id: "b1", name: "Groceries", amount: 100, categoryId: "c1" },
  ];
  return {
    transaction: {
      findMany: async () => expenses,
      aggregate: async () => ({ _sum: { amount: 520 } }),
    },
    budget: {
      findMany: async () => budgets,
    },
  } as any;
}

describe("computeInsights", () => {
  it("returns insights and alerts arrays without throwing", async () => {
    const db = makeDb();
    const result = await computeInsights("user-1", db);
    expect(result.insights).toBeDefined();
    expect(Array.isArray(result.insights)).toBe(true);
    expect(result.alerts).toBeDefined();
    expect(Array.isArray(result.alerts)).toBe(true);
  });

  it("produces an alert for the over-budget case", async () => {
    const db = makeDb();
    const { alerts } = await computeInsights("user-1", db);
    const overBudget = alerts.find((a) => a.id === "over-budget-b1");
    expect(overBudget).toBeDefined();
    expect(overBudget!.severity).toBeDefined();
  });
});
