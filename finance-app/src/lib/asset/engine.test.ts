import { describe, it, expect, vi, beforeEach } from "vitest";
import { getNetWorthSummary, getAssetAllocation, projectNetWorth, getAssetAiExplanation } from "./engine";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    asset: {
      findMany: vi.fn(),
    },
  },
}));

describe("Net Worth & Asset Management Engine (NWAME) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates total assets correctly based on owned percentage", async () => {
    (prisma.asset.findMany as any).mockResolvedValueOnce([
      { id: "a1", name: "Savings", currentValue: 5000, ownership: "100", type: "SavingsAccount" },
      { id: "a2", name: "Joint Car", currentValue: 20000, ownership: "50", type: "Vehicle" }, // owned 10,000 value
    ]);

    const summary = await getNetWorthSummary("u1");

    expect(summary.totalAssets).toBe(15000);
    expect(summary.totalLiabilities).toBe(0);
    expect(summary.netWorth).toBe(15000);
  });

  it("groups assets by type and calculates weights", async () => {
    (prisma.asset.findMany as any).mockResolvedValueOnce([
      { id: "a1", currentValue: 8000, ownership: "100", type: "RealEstate" },
      { id: "a2", currentValue: 2000, ownership: "100", type: "Cash" },
    ]);

    const allocation = await getAssetAllocation("u1");

    expect(allocation.length).toBe(2);
    expect(allocation[0].type).toBe("RealEstate");
    expect(allocation[0].percentage).toBe(80);
    expect(allocation[1].percentage).toBe(20);
  });
  it("projects net worth values over future months", async () => {
    (prisma.asset.findMany as any).mockResolvedValue([
      { id: "a1", currentValue: 10000, ownership: "100", appreciationRate: 12.0, type: "Stock" }, // 12% annual = 1% monthly
    ]);

    const points = await projectNetWorth("u1", 2);

    expect(points.length).toBe(3); // M0, M1, M2
    expect(points[0].projectedNetWorth).toBe(10000);
    // Month 1: 10000 * 1.01 + 800 savings surplus = 10900
    expect(points[1].projectedNetWorth).toBe(10900);
  });

  it("recommends diversification on concentration risks", () => {
    const summary = { totalAssets: 10000, totalLiabilities: 0, netWorth: 10000 };
    const alloc = [{ type: "Crypto", totalValue: 8000, percentage: 80 }];

    const advice = getAssetAiExplanation(summary, alloc);

    expect(advice.riskRating).toBe("High");
    expect(advice.analysis).toContain("High concentration detected");
  });
});
