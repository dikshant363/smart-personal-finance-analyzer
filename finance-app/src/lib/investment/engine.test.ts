import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateInvestmentPerformance,
  calculatePortfolioMetrics,
  calculateAssetAllocation,
  calculatePortfolioAllocation,
  generateAIInvestmentExplanation,
} from "./engine";

describe("Investment & Wealth Management Platform (IWMP) Tests", () => {
  const mockInvestments = [
    {
      id: "inv1",
      name: "Apple Inc.",
      assetClass: "Stocks",
      purchasePrice: 150,
      quantity: 10,
      currentValue: 1800,
      currency: "USD",
      fees: 15,
      portfolio: { name: "Personal" },
    },
    {
      id: "inv2",
      name: "US Treasury 10Y Bond",
      assetClass: "Bonds",
      purchasePrice: 1000,
      quantity: 2,
      currentValue: 2050,
      currency: "USD",
      fees: 10,
      portfolio: { name: "Retirement" },
    },
  ];

  it("calculates individual investment performance metrics", () => {
    const perf = calculateInvestmentPerformance(mockInvestments[0]);

    // totalInvested = 150 * 10 + 15 = 1515
    expect(perf.totalInvested).toBe(1515);
    expect(perf.profitLoss).toBe(285); // 1800 - 1515
    expect(perf.percentageReturn).toBeCloseTo(18.81, 1);
  });

  it("calculates aggregated portfolio-wide wealth metrics", () => {
    const metrics = calculatePortfolioMetrics(mockInvestments);

    // totalInvested = 1515 + 2010 = 3525
    // currentValue = 1800 + 2050 = 3850
    expect(metrics.totalInvested).toBe(3525);
    expect(metrics.currentValue).toBe(3850);
    expect(metrics.profitLoss).toBe(325);
    expect(metrics.diversificationScore).toBeGreaterThan(0.4);
  });

  it("computes asset allocations correctly", () => {
    const allocations = calculateAssetAllocation(mockInvestments);

    expect(allocations.length).toBe(2);
    expect(allocations[0].category).toBe("Bonds"); // 2050 vs 1800
  });

  it("builds user safety-compliant AI composition educational text summary", () => {
    const metrics = calculatePortfolioMetrics(mockInvestments);
    const alloc = calculateAssetAllocation(mockInvestments);
    const expl = generateAIInvestmentExplanation(metrics, alloc);

    expect(expl).toContain("Portfolio Composition Summary");
    expect(expl).toContain("HHI");
    expect(expl).toContain("does not recommend purchasing or selling");
  });
});
