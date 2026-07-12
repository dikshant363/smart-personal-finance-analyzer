import { describe, it, expect } from "vitest";
import { calculateHealthScore } from "./engine";

function buildDb() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const start = new Date(y, m, 1);
  const end = now;
  const catId = "cat-1";

  const db: any = {
    transaction: {
      groupBy: async () => [
        { type: "Income", _sum: { amount: 1000 } },
        { type: "Expense", _sum: { amount: 600 } },
      ],
      findMany: async (opts: any) => {
        if (opts?.select?.amount && opts?.where?.type === "Income") {
          return [{ amount: 500 }, { amount: 500 }];
        }
        if (opts?.select?.date) {
          return [{ date: new Date(y, m, 5) }, { date: new Date(y, m, 15) }];
        }
        return [];
      },
      aggregate: async (opts: any) => {
        if (opts?.where?.type === "Expense") {
          return { _sum: { amount: 1800 } };
        }
        if (opts?.where?.type === "Income") {
          return { _sum: { amount: 3000 } };
        }
        return { _sum: { amount: 200 } };
      },
    },
    category: {
      findMany: async () => [{ id: catId, name: "Food" }],
    },
    budget: {
      findMany: async () => [
        { id: "b1", amount: 300, categoryId: catId },
      ],
    },
    profile: {
      findUnique: async () => ({ currency: "USD" }),
    },
    scoreHistory: {
      findFirst: async () => null,
    },
  };

  return { db, start, end, catId };
}

describe("calculateHealthScore", () => {
  it("returns valid result with in-memory db", async () => {
    const { db } = buildDb();
    const result = await calculateHealthScore("user-1", db as any);
    expect(typeof result.score).toBe("number");
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.dimensions.length).toBe(8);
    expect(typeof result.band).toBe("string");
  });
});
