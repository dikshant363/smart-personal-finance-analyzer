import { describe, it, expect } from "vitest";
import { buildExplanation } from "./engine";

describe("Decision Intelligence Explainability Tests", () => {
  it("structures health score calculation trace with confidence levels", () => {
    const trace = buildExplanation("Score", { score: 85, monthsCovered: 5 });

    expect(trace.title).toContain("Health");
    expect(trace.confidence).toBe("High");
    expect(trace.calculationSources).toContain("HealthScoreEngine");
  });

  it("handles forecasting projections with lower confidence classifications", () => {
    const trace = buildExplanation("Forecast", { expectedReturn: 0.08, inflationRate: 0.03, years: 10 });

    expect(trace.confidence).toBe("Low");
    expect(trace.assumptions.length).toBeGreaterThan(0);
  });
});
