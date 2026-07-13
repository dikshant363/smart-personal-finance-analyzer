import { describe, it, expect } from "vitest";
import { runMonteCarlo, runSensitivityAnalysis } from "./engine";

describe("Monte Carlo Stochastic Engine Tests", () => {
  const config = {
    simulationsCount: 100,
    seed: 42,
    years: 5,
    initialValue: 50000,
    annualContribution: 6000,
    expectedReturn: 0.07,
    expectedVolatility: 0.12,
    inflationRate: 0.03,
    goalTarget: 100000,
  };

  it("yields identical output for identical seeds (reproducibility guarantee)", () => {
    const res1 = runMonteCarlo(config);
    const res2 = runMonteCarlo(config);

    expect(res1.p50).toEqual(res2.p50);
    expect(res1.goalProbability).toEqual(res2.goalProbability);
  });

  it("calculates sensitivity changes relative to the baseline configuration", () => {
    const sensitivities = runSensitivityAnalysis(config);
    const returnUp = sensitivities.find((s) => s.scenarioName === "Expected Return +2%");

    expect(sensitivities.length).toBe(5);
    expect(returnUp).toBeDefined();
  });
});
