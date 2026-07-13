import { describe, it, expect } from "vitest";
import { computeBusinessPL } from "./engine";

describe("Small Business & Freelancer Financial Workspace Tests", () => {
  it("calculates accurate P&L sheet net profit margins", () => {
    const expenses = [
      { category: "Advertising", amount: 200 },
      { category: "Software Utilities", amount: 150 },
    ];
    const report = computeBusinessPL(2500, expenses);

    expect(report.revenue).toBe(2500);
    expect(report.expenses["Advertising"]).toBe(200);
    expect(report.netProfit).toBe(2150);
  });
});
