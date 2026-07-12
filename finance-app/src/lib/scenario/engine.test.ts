import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulateScenario, compareScenarios, getScenarioAiExplanation } from "./engine";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    goal: {
      findMany: vi.fn().mockResolvedValue([
        { id: "g1", name: "Emergency Goal", targetAmount: 10000, currentAmount: 8000 },
      ]),
    },
  },
}));

describe("Life Planning & Financial Scenario Engine (LPFSE) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates deterministic cash flow, savings, and scores", async () => {
    const input = {
      id: "sc1",
      name: "Immediate House",
      type: "BuyHouse",
      estimatedCost: 15000,
      expectedIncomeImpact: 0,
      expectedExpenseImpact: 1200, // exceeds steady surplus of 800
      durationMonths: 24,
      startDate: new Date(),
    };

    const res = await simulateScenario("u1", input);

    expect(res.cashFlowImpactMonthly).toBe(-1200);
    expect(res.savingsImpactMonthly).toBe(-400); // 800 - 1200
    expect(res.simulatedSavingsTotal).toBeLessThan(0); // 5000 - 400 * 24 - 15000
    expect(res.simulatedHealthScore).toBeLessThan(50);
    expect(res.risks).toContain("Negative monthly cash flow makes this scenario highly unsustainable.");
  });

  it("generates correct AI tradeoffs explainers for house purchases", () => {
    const mockRes = {
      scenarioId: "sc1",
      name: "Immediate House",
      type: "BuyHouse",
      durationMonths: 24,
      cashFlowImpactMonthly: -1200,
      savingsImpactMonthly: -400,
      simulatedSavingsTotal: -19600,
      simulatedHealthScore: 10,
      simulatedEmergencyFundScore: 20,
      completionProbability: 30,
      risks: [],
      goalDelays: [],
    };

    const expl = getScenarioAiExplanation(mockRes);

    expect(expl.advantages).toContain("Builds long-term home equity asset.");
    expect(expl.disadvantages).toContain("High upfront down payment depletes initial liquid margins.");
    expect(expl.tradeoffs).toContain("Trading immediate liquid cash");
  });
});
