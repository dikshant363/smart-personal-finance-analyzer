import { describe, it, expect } from "vitest";
import { calculateRetirementProjections, generateAIRetirementExplanation } from "./engine";

describe("Retirement & Long-Term Financial Planning Platform Tests", () => {
  const mockPlan = {
    name: "Golden Years",
    profileType: "Traditional",
    currentAge: 30,
    retirementAge: 65,
    lifeExpectancy: 85,
    currentSavings: 50000,
    monthlyContribution: 500,
    expectedExpenses: 3000, // $3000/mo = $36000/yr in today's money
    expectedReturn: 0.07, // 7%
    expectedInflation: 0.025, // 2.5%
    withdrawalStrategy: "Safe Withdrawal (4%)",
    currency: "USD",
  };

  it("calculates accumulation savings compounding correctly", () => {
    const { trajectory, metrics } = calculateRetirementProjections(mockPlan);

    expect(metrics.yearsUntilRetirement).toBe(35);
    expect(metrics.projectedNestEgg).toBeGreaterThan(mockPlan.currentSavings);
    expect(trajectory.length).toBeGreaterThan(35);

    const retirePoint = trajectory[34];
    expect(retirePoint.age).toBe(65);
    expect(retirePoint.savings).toBe(metrics.projectedNestEgg);
  });

  it("calculates withdrawal decumulation duration correctly", () => {
    const { metrics } = calculateRetirementProjections(mockPlan);

    expect(metrics.annualExpensesAtRetirement).toBeGreaterThan(mockPlan.expectedExpenses * 12);
    expect(metrics.withdrawalDurationYears).toBeLessThanOrEqual(20);
  });

  it("generates appropriate educational non-advice AI explanations", () => {
    const { metrics } = calculateRetirementProjections(mockPlan);
    const text = generateAIRetirementExplanation(metrics, mockPlan);

    expect(text).toContain("Golden Years");
    expect(text).toContain("not regulated investment or tax advice");
    expect(text).toContain("Accumulation Phase");
  });
});
