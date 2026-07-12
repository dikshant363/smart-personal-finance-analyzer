import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeSync, MockProvider, CSVProvider, JSONProvider } from "./engine";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    transaction: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    syncHistory: {
      create: vi.fn().mockResolvedValue({ id: "sh1" }),
      update: vi.fn(),
    },
    category: {
      findFirst: vi.fn(),
    },
  },
}));

describe("Financial Connectivity & Integration Platform (FCIP) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("MockProvider executes and logs sync results", async () => {
    (prisma.transaction.findFirst as any).mockResolvedValueOnce(null);

    const provider = new MockProvider();
    const result = await provider.sync("u1", undefined, prisma);

    expect(result.transactionsImported).toBeGreaterThan(0);
    expect(prisma.transaction.create).toHaveBeenCalled();
  });

  it("CSVProvider parses data columns and ignores duplicate records", async () => {
    const csv = "date,amount,description,type,category\n2026-07-10,120,Starbucks,Expense,Food";

    // Simulate duplicate check matching record
    (prisma.transaction.findFirst as any).mockResolvedValueOnce({ id: "dup1" });

    const provider = new CSVProvider();
    const result = await provider.sync("u1", csv, prisma);

    expect(result.transactionsImported).toBe(0);
    expect(result.duplicatesFound).toBe(1);
  });

  it("JSONProvider parses nested transaction objects correctly", async () => {
    const jsonStr = JSON.stringify([
      { date: "2026-07-10", amount: 25, description: "Netflix", type: "Expense", category: "Entertainment" }
    ]);

    (prisma.transaction.findFirst as any).mockResolvedValueOnce(null);

    const provider = new JSONProvider();
    const result = await provider.sync("u1", jsonStr, prisma);

    expect(result.transactionsImported).toBe(1);
    expect(prisma.transaction.create).toHaveBeenCalled();
  });
});
