import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDebtOverview, calculateDebtHealthScore, simulateRepaymentStrategy } from "./engine";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    liability: {
      findMany: vi.fn(),
    },
    transaction: {
      aggregate: vi.fn().mockResolvedValue({
        _sum: { amount: 9000 }, // Average monthly income = 3000
      }),
    },
  },
}));

describe("Liability, Debt & Credit Management Engine (LDCME) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates active total debt and monthly EMI totals", async () => {
    (prisma.liability.findMany as any).mockResolvedValueOnce([
      { id: "d1", outstandingBalance: 12000, emiAmount: 300, interestRate: 5.0, status: "Active" },
      { id: "d2", outstandingBalance: 4000, emiAmount: 150, interestRate: 18.0, status: "Active" },
    ]);

    const overview = await getDebtOverview("u1");

    expect(overview.totalDebt).toBe(16000);
    expect(overview.monthlyEmiTotal).toBe(450);
    expect(overview.debtToIncomeRatio).toBe(15); // 450 / 3000 = 15%
  });

  it("deducts debt health score points for high DTI ratios", async () => {
    (prisma.liability.findMany as any).mockResolvedValue([
      { id: "d1", outstandingBalance: 45000, emiAmount: 1500, interestRate: 6.0, status: "Active" }, // EMI = 1500, DTI = 50%
    ]);

    const score = await calculateDebtHealthScore("u1");

    // DTI > 40 deducts 30 points, size > 20000 deducts 10 points -> score should be around 60
    expect(score).toBeLessThanOrEqual(70);
  });

  it("projects interest savings on Avalanche strategy", async () => {
    const debts = [
      { id: "d1", outstandingBalance: 5000, emiAmount: 150, interestRate: 6.0, status: "Active" },
      { id: "d2", outstandingBalance: 3000, emiAmount: 100, interestRate: 18.0, status: "Active" }, // Focus extra here
    ];

    (prisma.liability.findMany as any).mockResolvedValue(debts);

    // Run strategy with extra $200 monthly repayment
    const avalanche = await simulateRepaymentStrategy("u1", "Avalanche", 200);

    expect(avalanche.timeSavedMonths).toBeGreaterThan(0);
    expect(avalanche.interestSaved).toBeGreaterThan(0);
  });
});
