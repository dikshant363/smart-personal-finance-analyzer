import { describe, it, expect } from "vitest";
import { computeRentVsBuy } from "./engine";

describe("Financial Intelligence Hub Engine Tests", () => {
  it("compares buying vs renting cash expenditures properly", () => {
    const res = computeRentVsBuy({
      rentMonthly: 2000,
      buyPrice: 350000,
      downPayment: 70000,
      years: 10,
    });

    expect(res.totalRentCost).toBeGreaterThan(0);
    expect(res.totalBuyCost).toBeGreaterThan(0);
    expect(res.advice).toBeDefined();
  });
});
