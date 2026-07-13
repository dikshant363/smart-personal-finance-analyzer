import { describe, it, expect } from "vitest";
import { simulateScenario } from "./engine";

describe("Digital Twin Model Projections Tests", () => {
  const baseline = {
    monthlyIncome: 6000,
    monthlyExpenses: 4000,
    currentNetWorth: 80000,
    investmentBalance: 30000,
    debtBalance: 10000,
  };

  it("calculates baseline net worth over years correctly", () => {
    const assumptions = { inflationRate: 0.03, investmentReturn: 0.08, salaryGrowth: 0.04 };
    const result = simulateScenario(baseline, {}, assumptions, 5);

    expect(result.years.length).toBe(5);
    expect(result.projectedNetWorthBaseline[4]).toBeGreaterThan(result.projectedNetWorthBaseline[0]);
  });

  it("applies extra discretionary spend reductions and savings boosts accurately", () => {
    const assumptions = { inflationRate: 0.03, investmentReturn: 0.08, salaryGrowth: 0.04 };
    
    const result = simulateScenario(
      baseline,
      { discretionarySpendDelta: -500 }, // Reduce spend by $500 monthly
      assumptions,
      5
    );

    expect(result.cashFlowScenario[0]).toBeGreaterThan(result.cashFlowBaseline[0]);
  });
});
