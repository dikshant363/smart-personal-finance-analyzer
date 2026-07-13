import { describe, it, expect } from "vitest";
import { calculateRiskGaps, generateAIRiskExplanation } from "./engine";

describe("Risk Management & Insurance Platform Tests", () => {
  const mockPolicies = [
    {
      id: "p1",
      name: "Group Life Policy",
      carrier: "MetLife",
      category: "Life",
      coverageAmount: 250000,
      premiumAmount: 15,
      billingFrequency: "Monthly",
      status: "Active",
    },
    {
      id: "p2",
      name: "Long Term Disability",
      carrier: "Unum",
      category: "Disability",
      coverageAmount: 2000,
      premiumAmount: 30,
      billingFrequency: "Monthly",
      status: "Active",
    },
  ];

  it("evaluates coverage gap assessments correctly", () => {
    const summary = calculateRiskGaps(100000, 4000, mockPolicies, { liquidAssets: 15000 });

    expect(summary.lifeInsuranceRecommended).toBe(1000000); // 100k * 10
    expect(summary.lifeInsuranceActual).toBe(250000);
    expect(summary.lifeInsuranceGap).toBe(750000);

    expect(summary.emergencyFundRecommended).toBe(24000); // 4k * 6
    expect(summary.emergencyFundActual).toBe(15000);
    expect(summary.emergencyFundGap).toBe(9000);
  });

  it("builds educational disclaimers inside AI safety content", () => {
    const summary = calculateRiskGaps(80000, 3000, mockPolicies, { liquidAssets: 18000 });
    const expl = generateAIRiskExplanation(summary);

    expect(expl).toContain("does not issue insurance contracts");
    expect(expl).toContain("Life Insurance");
    expect(expl).toContain("Resilience Fund");
  });
});
