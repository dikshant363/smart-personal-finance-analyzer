import { describe, it, expect } from "vitest";
import { computeAnalytics } from "./analytics";

describe("computeAnalytics", () => {
  it("computes analytics from recommendation rows", async () => {
    const db = {
      recommendation: {
        findMany: async () => [
          { status: "active", monthlySavings: 10, scoreImpact: 2, category: "savings", userId: "u1" },
          { status: "accepted", monthlySavings: 20, scoreImpact: 3, category: "budget_optimization", userId: "u1" },
          { status: "completed", monthlySavings: 0, scoreImpact: 0, category: "positive", userId: "u1" },
        ],
      },
    };

    const a = await computeAnalytics("u1", db as any);

    expect(a.total).toBe(3);
    expect(a.accepted).toBe(1);
    expect(a.completed).toBe(1);
    expect(a.acceptanceRate).toBeGreaterThanOrEqual(0);
    expect(a.acceptanceRate).toBeLessThanOrEqual(1);
    expect(typeof a.avgMonthlySavings).toBe("number");
    expect(a.topCategories.length).toBeGreaterThanOrEqual(1);
  });
});
