import { describe, it, expect } from "vitest";
import { clamp, bandFor, scoreFromInputs, buildRecommendations, buildExplanations } from "./dimensions";

describe("clamp", () => {
  it("clamps within bounds", () => {
    expect(clamp(50)).toBe(50);
    expect(clamp(-5)).toBe(0);
    expect(clamp(105)).toBe(100);
    expect(clamp(200, 0, 200)).toBe(200);
  });
});

describe("bandFor", () => {
  it("maps scores to bands", () => {
    expect(bandFor(95)).toBe("Excellent");
    expect(bandFor(80)).toBe("Very Good");
    expect(bandFor(65)).toBe("Good");
    expect(bandFor(50)).toBe("Needs Improvement");
    expect(bandFor(30)).toBe("Poor");
    expect(bandFor(10)).toBe("Critical");
  });
});

const healthyInputs = {
  income: 1000,
  expense: 600,
  net: 400,
  savingsLast3Months: 1200,
  expenseLast3Months: 1800,
  avgMonthlyExpense: 600,
  incomeTxCount: 2,
  incomeAmounts: [500, 500],
  expenseByCategory: [
    { name: "Food", amount: 400 },
    { name: "Rent", amount: 200 },
  ],
  budgetItems: [{ amount: 300, spent: 200 }],
  activeDays: 20,
  daysInWindow: 30,
  currency: "USD" as const,
};

describe("scoreFromInputs", () => {
  it("healthy sample: 8 dimensions, total in [0,100], savings_ratio present", () => {
    const { dimensions, total } = scoreFromInputs(healthyInputs);
    expect(dimensions.length).toBe(8);
    expect(total).toBeGreaterThanOrEqual(0);
    expect(total).toBeLessThanOrEqual(100);
    expect(dimensions.find((d) => d.key === "savings_ratio")).toBeDefined();
  });

  it("edge: zero income/expense returns finite total in [0,100]", () => {
    const zero = {
      income: 0,
      expense: 0,
      net: 0,
      savingsLast3Months: 0,
      expenseLast3Months: 0,
      avgMonthlyExpense: 0,
      incomeTxCount: 0,
      incomeAmounts: [] as number[],
      expenseByCategory: [] as { name: string; amount: number }[],
      budgetItems: [] as { amount: number; spent: number }[],
      activeDays: 0,
      daysInWindow: 30,
      currency: "USD" as const,
    };
    const { total } = scoreFromInputs(zero);
    expect(Number.isFinite(total)).toBe(true);
    expect(total).toBeGreaterThanOrEqual(0);
    expect(total).toBeLessThanOrEqual(100);
  });

  it("edge: no budgets => budget_discipline score 50", () => {
    const noBudget = { ...healthyInputs, budgetItems: [] };
    const { dimensions } = scoreFromInputs(noBudget);
    const bd = dimensions.find((d) => d.key === "budget_discipline");
    expect(bd).toBeDefined();
    expect(bd!.score).toBe(50);
  });

  it("edge: no expenses => expense_distribution and recurring_burden score 100", () => {
    const noExpense = { ...healthyInputs, expense: 0, expenseByCategory: [] };
    const { dimensions } = scoreFromInputs(noExpense);
    const ed = dimensions.find((d) => d.key === "expense_distribution");
    const rb = dimensions.find((d) => d.key === "recurring_burden");
    expect(ed).toBeDefined();
    expect(rb).toBeDefined();
    expect(ed!.score).toBe(100);
    expect(rb!.score).toBe(100);
  });
});

describe("buildRecommendations", () => {
  it("returns array; below-ideal dims have priority and potentialGain>=0", () => {
    const { dimensions } = scoreFromInputs(healthyInputs);
    const recs = buildRecommendations(dimensions);
    expect(Array.isArray(recs)).toBe(true);
    for (const r of recs) {
      expect(["high", "medium", "low"]).toContain(r.priority);
      expect(r.potentialGain).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("buildExplanations", () => {
  it("previous null => [{direction:'flat',...}]", () => {
    const { dimensions } = scoreFromInputs(healthyInputs);
    const exps = buildExplanations(dimensions, null);
    expect(exps.length).toBeGreaterThan(0);
    expect(exps[0].direction).toBe("flat");
  });

  it("previous with up/down diffs returns up/down entries", () => {
    const { dimensions } = scoreFromInputs(healthyInputs);
    const prev = dimensions.map((d) => ({
      ...d,
      score: d.score + (d.key === "savings_ratio" ? -10 : d.key === "cash_flow" ? 10 : 0),
    }));
    const exps = buildExplanations(dimensions, prev);
    const dirs = exps.map((e) => e.direction);
    expect(dirs.some((d) => d === "up" || d === "down")).toBe(true);
  });
});
