import { describe, it, expect } from "vitest";
import { generateRuleRecommendations } from "./rules";
import type { ScoreResult } from "../score/types";
import type { AnalysisResult } from "../analysis/types";

describe("generateRuleRecommendations", () => {
  it("produces savings and budget recs from score + alerts", () => {
    const score: ScoreResult = {
      score: 55,
      band: "Good",
      month: "2026-07",
      dimensions: [
        {
          key: "savings_ratio",
          name: "Savings Ratio",
          current: 40,
          currentLabel: "40%",
          ideal: 30,
          idealLabel: "30%",
          weight: 20,
          score: 40,
          contribution: 8,
          suggestion: "Keep saving.",
        },
        {
          key: "savings_rate",
          name: "Savings Rate",
          current: 10,
          currentLabel: "10%",
          ideal: 30,
          idealLabel: "30%",
          weight: 20,
          score: 20,
          contribution: 4,
          suggestion: "Increase savings.",
        },
        {
          key: "emergency_fund",
          name: "Emergency Fund",
          current: 3,
          currentLabel: "3 months",
          ideal: 3,
          idealLabel: "3 months",
          weight: 15,
          score: 30,
          contribution: 4,
          suggestion: "Build emergency fund.",
        },
      ],
      recommendations: [],
      explanations: [],
      estimatedPotentialGain: 0,
      currency: "USD",
      calculatedAt: new Date().toISOString(),
    };

    const analysis: AnalysisResult = {
      alerts: [
        {
          id: "a",
          title: "Over budget: Rent",
          severity: "high",
          detail: "",
          evidence: "₹3000 / ₹2500",
        },
      ],
      insights: [],
      trends: {} as any,
      generatedAt: new Date().toISOString(),
    };

    let recs: ReturnType<typeof generateRuleRecommendations>;
    expect(() => {
      recs = generateRuleRecommendations({
        score,
        analysis,
        monthlyIncome: 1000,
        monthlyExpense: 600,
        currency: "USD",
      });
    }).not.toThrow();

    recs = generateRuleRecommendations({
      score,
      analysis,
      monthlyIncome: 1000,
      monthlyExpense: 600,
      currency: "USD",
    });

    expect(Array.isArray(recs)).toBe(true);
    expect(recs.some((r) => r.category === "savings")).toBe(true);
    expect(recs.some((r) => r.category === "budget_optimization")).toBe(true);

    for (const r of recs) {
      expect(Number.isFinite(r.monthlySavings)).toBe(true);
      expect(Number.isFinite(r.annualSavings)).toBe(true);
      expect(Number.isFinite(r.scoreImpact)).toBe(true);
      expect(r.monthlySavings).toBeGreaterThanOrEqual(0);
      expect(r.annualSavings).toBeGreaterThanOrEqual(0);
      expect(r.scoreImpact).toBeGreaterThanOrEqual(0);
    }
  });
});
