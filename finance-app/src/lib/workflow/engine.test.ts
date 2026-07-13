import { describe, it, expect } from "vitest";
import { evaluateCondition } from "./engine";

describe("Workflow Rules & Condition Evaluators Tests", () => {
  it("validates field numerical thresholds checks", () => {
    const payload = { amount: 1500, category: "Luxury" };
    const cond1 = { field: "amount", operator: "greater_than", value: 1000 } as const;
    const cond2 = { field: "category", operator: "equals", value: "Dining" } as const;

    expect(evaluateCondition(payload, cond1)).toBe(true);
    expect(evaluateCondition(payload, cond2)).toBe(false);
  });
});
