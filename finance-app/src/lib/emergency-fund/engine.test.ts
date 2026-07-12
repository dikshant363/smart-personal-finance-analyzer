import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateEmergencyMetrics } from "./engine";
import { simulateScenario } from "./simulator";
import { generateEmergencyRecommendations } from "./recommendations";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    emergencyFundSettings: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    transaction: {
      groupBy: vi.fn(),
    },
    goal: {
      findMany: vi.fn(),
    },
  },
}));

describe("Emergency Fund Engine & Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates basic metrics based on transaction data", async () => {
    (prisma.emergencyFundSettings.findUnique as any).mockResolvedValueOnce({
      targetMonths: 6,
      customEssentialExpenses: null,
      customReserve: null,
    });

    (prisma.transaction.groupBy as any).mockResolvedValueOnce([
      { type: "Income", _sum: { amount: 30000 } }, // 5000/mo avg
      { type: "Expense", _sum: { amount: 18000 } }, // 3000/mo avg (essential defaults to 2100)
    ]);

    (prisma.goal.findMany as any).mockResolvedValueOnce([]);

    const metrics = await calculateEmergencyMetrics("u1");

    expect(metrics.monthlyEssentialExpenses).toBe(2100);
    expect(metrics.emergencyFundTarget).toBe(12600);
    expect(metrics.currentEmergencyFund).toBe(12000); // 30000 - 18000
    expect(metrics.coverageDurationMonths).toBeCloseTo(5.71, 1);
  });

  it("applies settings overrides", async () => {
    (prisma.emergencyFundSettings.findUnique as any).mockResolvedValueOnce({
      targetMonths: 3,
      customEssentialExpenses: 2500,
      customReserve: 5000,
    });

    (prisma.transaction.groupBy as any).mockResolvedValueOnce([]);
    (prisma.goal.findMany as any).mockResolvedValueOnce([]);

    const metrics = await calculateEmergencyMetrics("u1");

    expect(metrics.monthlyEssentialExpenses).toBe(2500);
    expect(metrics.currentEmergencyFund).toBe(5000);
    expect(metrics.emergencyFundTarget).toBe(7500);
    expect(metrics.coverageDurationMonths).toBe(2);
  });

  it("generates correct readiness categories", async () => {
    (prisma.emergencyFundSettings.findUnique as any).mockResolvedValueOnce({
      targetMonths: 6,
      customEssentialExpenses: 2000,
      customReserve: 12000, // 100% target coverage
    });

    (prisma.transaction.groupBy as any).mockResolvedValueOnce([
      { type: "Income", _sum: { amount: 30000 } }, // positive buffer
      { type: "Expense", _sum: { amount: 18000 } },
    ]);
    (prisma.goal.findMany as any).mockResolvedValueOnce([]);

    const metrics = await calculateEmergencyMetrics("u1");
    expect(metrics.readinessScore).toBeGreaterThanOrEqual(90);
    expect(metrics.readinessCategory).toBe("Excellent");
  });

  it("simulates job loss scenario correctly", () => {
    const result = simulateScenario("job_loss", {
      currentReserve: 10000,
      essentialExpenses: 2000,
      monthlyContribution: 200,
      averageMonthlyIncome: 4000,
    });

    expect(result.cashRemaining).toBe(10000);
    expect(result.monthsCovered).toBe(5);
    expect(result.financialRisk).toBe("High");
    expect(result.suggestedActions.length).toBeGreaterThan(0);
  });

  it("simulates medical emergency scenario correctly", () => {
    const result = simulateScenario("medical_emergency", {
      currentReserve: 10000,
      essentialExpenses: 2000,
      monthlyContribution: 200,
      averageMonthlyIncome: 4000,
      paramValue: 3000,
    });

    expect(result.cashRemaining).toBe(7000);
    expect(result.monthsCovered).toBe(3.5);
    expect(result.recoveryTimelineMonths).toBe(15);
  });

  it("generates recommendations when below target", () => {
    const metrics: any = {
      monthlyEssentialExpenses: 2000,
      emergencyFundTarget: 12000,
      currentEmergencyFund: 6000,
      coverageDurationMonths: 3,
      savingsRate: 1000,
      monthlyContribution: 200,
      readinessScore: 60,
      readinessCategory: "Moderate",
    };

    const recs = generateEmergencyRecommendations(metrics, "USD");
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].type).toBe("rebuild_fund");
  });
});
