import { describe, it, expect, vi, beforeEach } from "vitest";
import { CopilotEngine, MockGeminiProvider } from "./engine";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    message: {
      create: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    profile: {
      findUnique: vi.fn().mockResolvedValue({ currency: "USD" }),
    },
  },
}));

vi.mock("../debt", () => ({
  getDebtOverview: vi.fn().mockResolvedValue({ totalDebt: 12000 }),
  calculateDebtHealthScore: vi.fn().mockResolvedValue(85),
}));

vi.mock("../asset", () => ({
  getNetWorthSummary: vi.fn().mockResolvedValue({ netWorth: 28000, totalAssets: 40000 }),
}));

vi.mock("../portfolio", () => ({
  getPortfoliosSummary: vi.fn().mockResolvedValue([{ id: "p1" }]),
}));

describe("Financial Intelligence Copilot Platform (FICP) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds correct context variables from other engines", async () => {
    const copilot = new CopilotEngine();
    const context = await copilot.buildContext("u1");

    expect(context.netWorth).toBe(28000);
    expect(context.totalAssets).toBe(40000);
    expect(context.totalDebt).toBe(12000);
    expect(context.debtHealthScore).toBe(85);
  });

  it("MockGeminiProvider answers questions referencing calculations in context", async () => {
    const provider = new MockGeminiProvider();
    const context = {
      netWorth: 28000,
      totalAssets: 40000,
      totalDebt: 12000,
      debtHealthScore: 85,
      portfoliosCount: 1,
      currency: "USD",
    };

    const response = await provider.generate("Tell me about my score", context);

    expect(response).toContain("Health Score is **85/100**");
  });
});
