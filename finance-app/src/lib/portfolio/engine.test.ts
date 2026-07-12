import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPortfoliosSummary, createAccountTransfer, getPortfolioDistribution } from "./engine";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    portfolio: {
      findMany: vi.fn(),
    },
    account: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
    },
  },
}));

describe("Portfolio & Account Management Platform (FAPMP) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates total aggregated balances for portfolios", async () => {
    (prisma.portfolio.findMany as any).mockResolvedValueOnce([
      {
        id: "p1",
        name: "Personal",
        description: "Checking/Savings",
        accounts: [
          { id: "a1", currentBalance: 4000, status: "Active" },
          { id: "a2", currentBalance: 1200, status: "Active" },
        ],
      },
    ]);

    const summaries = await getPortfoliosSummary("u1");

    expect(summaries.length).toBe(1);
    expect(summaries[0].totalBalance).toBe(5200);
    expect(summaries[0].accountsCount).toBe(2);
  });

  it("executes secure balance transfers between accounts", async () => {
    const fromAcc = { id: "a1", name: "Savings", currentBalance: 5000, currency: "USD", userId: "u1" };
    const toAcc = { id: "a2", name: "Crypto", currentBalance: 1000, currency: "USD", userId: "u1" };

    (prisma.account.findUnique as any)
      .mockResolvedValueOnce(fromAcc)
      .mockResolvedValueOnce(toAcc);

    (prisma.account.update as any)
      .mockResolvedValueOnce({ ...fromAcc, currentBalance: 4500 })
      .mockResolvedValueOnce({ ...toAcc, currentBalance: 1500 });

    const mockTx = vi.fn().mockImplementation(async (cb) => cb(prisma));
    (prisma as any).$transaction = mockTx;

    const res = await createAccountTransfer("u1", "a1", "a2", 500);

    expect(res.newFromBalance).toBe(4500);
    expect(res.newToBalance).toBe(1500);
    expect(prisma.transaction.create).toHaveBeenCalledTimes(2); // Income + Expense transfer logs
  });
});
