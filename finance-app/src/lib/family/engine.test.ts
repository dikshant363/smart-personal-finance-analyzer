import { describe, it, expect } from "vitest";
import { calculateExpenseSplits } from "./engine";

describe("Household Expense Splitting Platform Tests", () => {
  it("divides expenditures equally among roommate lists", () => {
    const results = calculateExpenseSplits(90.00, ["u1", "u2", "u3"], "Equal");

    expect(results.length).toBe(3);
    expect(results[0].amount).toBe(30.00);
  });

  it("calculates customized ratio-based splits appropriately", () => {
    const customPercentages = { u1: 60, u2: 40 };
    const results = calculateExpenseSplits(150.00, ["u1", "u2"], "Percentage", customPercentages);

    expect(results.find(r => r.userId === "u1")?.amount).toBe(90.00);
    expect(results.find(r => r.userId === "u2")?.amount).toBe(60.00);
  });
});
