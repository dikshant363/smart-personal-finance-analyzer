import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateForecast, runSimulation, detectRisks } from "./engine";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    $queryRaw: vi.fn().mockImplementation((queryArgs: any) => {
      const sql = String(queryArgs?.[0] || "");
      if (sql.includes("YYYY-MM")) {
        return Promise.resolve([
          { month: "2026-01", income: 5000, expense: 3000 },
          { month: "2026-02", income: 5200, expense: 3100 },
          { month: "2026-03", income: 5500, expense: 3200 },
        ]);
      }
      if (sql.includes("date_trunc")) {
        return Promise.resolve([
          { date: new Date("2026-03-01"), income: 100, expense: 50 },
          { date: new Date("2026-03-02"), income: 100, expense: 60 },
        ]);
      }
      return Promise.resolve([]);
    }),
    transaction: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
      $queryRaw: vi.fn(),
      groupBy: vi.fn(),
    },
    category: { findMany: vi.fn() },
    budget: { findMany: vi.fn() },
  },
}));

vi.mock("../score/engine", () => ({
  calculateHealthScore: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("../analysis/cache", () => ({
  getCached: vi.fn(() => null),
  setCached: vi.fn(),
  cacheKey: vi.fn((userId: string, scope: string) => `${userId}:${scope}`),
}));

describe("generateForecast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a 30d expected cashflow forecast with deterministic points", async () => {
    (prisma.transaction.findMany as any).mockResolvedValueOnce([]);
    (prisma.transaction.groupBy as any).mockResolvedValueOnce([]);

    const result = await generateForecast({
      userId: "user-1",
      period: "30d",
      scenario: "expected",
      type: "cashflow",
    });

    expect(result.type).toBe("cashflow");
    expect(result.scenario).toBe("expected");
    expect(result.period).toBe("30d");
    expect(result.points.length).toBeGreaterThan(0);
    expect(typeof result.confidence).toBe("number");
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.points.every((p) => typeof p.date === "string" && typeof p.value === "number")).toBe(true);
  });

  it("applies scenario variance: best > expected > worst", async () => {
    (prisma.transaction.findMany as any).mockResolvedValueOnce([]);
    (prisma.transaction.groupBy as any).mockResolvedValueOnce([]);

    const [best, expected, worst] = await Promise.all([
      generateForecast({ userId: "user-1", period: "30d", scenario: "best", type: "cashflow" }),
      generateForecast({ userId: "user-1", period: "30d", scenario: "expected", type: "cashflow" }),
      generateForecast({ userId: "user-1", period: "30d", scenario: "worst", type: "cashflow" }),
    ]);

    const bestEnd = best.points[best.points.length - 1]?.value ?? 0;
    const expectedEnd = expected.points[expected.points.length - 1]?.value ?? 0;
    const worstEnd = worst.points[worst.points.length - 1]?.value ?? 0;

    expect(bestEnd).toBeGreaterThan(expectedEnd);
    expect(expectedEnd).toBeGreaterThan(worstEnd);
  });

  it("returns zero confidence with no transaction history", async () => {
    (prisma.$queryRaw as any).mockResolvedValueOnce([]);
    (prisma.transaction.findMany as any).mockResolvedValueOnce([]);
    (prisma.transaction.groupBy as any).mockResolvedValueOnce([]);

    const result = await generateForecast({
      userId: "user-empty",
      period: "30d",
      scenario: "expected",
      type: "cashflow",
    });

    expect(result.confidence).toBe(0);
    expect(result.points.length).toBeGreaterThan(0);
  });

  it("handles zero income edge case gracefully", async () => {
    (prisma.transaction.findMany as any).mockResolvedValueOnce([]);
    (prisma.transaction.groupBy as any).mockResolvedValueOnce([]);

    const result = await generateForecast({
      userId: "user-zero",
      period: "30d",
      scenario: "expected",
      type: "income",
    });

    expect(result.type).toBe("income");
    expect(result.points.every((p) => typeof p.value === "number")).toBe(true);
  });

  it("caches forecast results", async () => {
    (prisma.transaction.findMany as any).mockResolvedValueOnce([]);
    (prisma.transaction.groupBy as any).mockResolvedValueOnce([]);

    const first = await generateForecast({
      userId: "user-cache",
      period: "30d",
      scenario: "expected",
      type: "cashflow",
    });

    const second = await generateForecast({
      userId: "user-cache",
      period: "30d",
      scenario: "expected",
      type: "cashflow",
    });

    expect(first.generatedAt).toBe(second.generatedAt);
  });
});

describe("runSimulation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns baseline and simulated results with deltas", async () => {
    (prisma.transaction.findMany as any).mockResolvedValueOnce([]);
    (prisma.transaction.groupBy as any).mockResolvedValueOnce([]);

    const result = await runSimulation({
      userId: "user-sim",
      adjustments: {
        incomeChange: 500,
        expenseChange: -200,
      },
      period: "30d",
    });

    expect(result.baseline.type).toBe("cashflow");
    expect(result.simulated.type).toBe("cashflow");
    expect(typeof result.comparison.cashflowDelta).toBe("number");
    expect(typeof result.comparison.savingsDelta).toBe("number");
    expect(typeof result.comparison.scoreDelta).toBe("number");
  });
});

describe("detectRisks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns risk objects with required fields", async () => {
    (prisma.transaction.findMany as any).mockResolvedValueOnce([]);
    (prisma.category.findMany as any).mockResolvedValueOnce([]);
    (prisma.budget.findMany as any).mockResolvedValueOnce([]);

    const risks = await detectRisks("user-risk");

    expect(Array.isArray(risks)).toBe(true);
    for (const r of risks) {
      expect(typeof r.id).toBe("string");
      expect(typeof r.title).toBe("string");
      expect(typeof r.severity).toBe("string");
      expect(typeof r.detail).toBe("string");
      expect(typeof r.evidence).toBe("string");
    }
  });
});
