import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseCSV } from "./parser";
import { validateTransactionRow, detectDuplicateTransactions } from "./validation";
import { createApplicationBackup } from "./backup";
import { restoreApplicationBackup } from "./restore";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    profile: { findUnique: vi.fn(), upsert: vi.fn() },
    category: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    transaction: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    budget: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    goal: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    recurringItem: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    exchangeAudit: { create: vi.fn() },
  },
}));

describe("Data Exchange Platform (FDEP) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses CSV rows with comma separations and quotes", () => {
    const csv = "Date,Type,Amount,Description\n2026-01-01,Expense,15.50,\"Grocery Store, Inc.\"";
    const parsed = parseCSV(csv);

    expect(parsed.length).toBe(1);
    expect(parsed[0]["Type"]).toBe("Expense");
    expect(parsed[0]["Amount"]).toBe("15.50");
    expect(parsed[0]["Description"]).toBe("Grocery Store, Inc.");
  });

  it("validates transaction row types and amounts", () => {
    const validRow = { date: "2026-01-01", type: "Expense", amount: "52.30", description: "Gas" };
    const invalidRow = { date: "invalid-date", type: "Other", amount: "-10", description: "" };

    const validResult = validateTransactionRow(validRow, 0);
    const invalidResult = validateTransactionRow(invalidRow, 1);

    expect(validResult.errors.length).toBe(0);
    expect(validResult.data?.amount).toBe(52.3);

    expect(invalidResult.errors.length).toBe(4); // type, date, amount, description
  });

  it("detects exact duplicate transactions", async () => {
    const mockExist = [
      { id: "1", amount: 15.5, type: "Expense", date: new Date("2026-01-01"), description: "Netflix" },
    ];

    (prisma.transaction.findMany as any).mockResolvedValueOnce(mockExist);

    const candidates = [
      { type: "Expense" as const, amount: 15.5, description: "Netflix", date: new Date("2026-01-01") },
      { type: "Expense" as const, amount: 20.0, description: "Gas", date: new Date("2026-01-01") },
    ];

    const checked = await detectDuplicateTransactions("u1", candidates);

    expect(checked[0].isDuplicate).toBe(true);
    expect(checked[1].isDuplicate).toBeUndefined();
  });

  it("generates structured backup metadata payload", async () => {
    (prisma.profile.findUnique as any).mockResolvedValueOnce({ currency: "USD" });
    (prisma.category.findMany as any).mockResolvedValueOnce([]);
    (prisma.transaction.findMany as any).mockResolvedValueOnce([]);
    (prisma.budget.findMany as any).mockResolvedValueOnce([]);
    (prisma.goal.findMany as any).mockResolvedValueOnce([]);
    (prisma.recurringItem.findMany as any).mockResolvedValueOnce([]);

    const backup = await createApplicationBackup("u1");

    expect(backup.version).toBe("1.0");
    expect(backup.profile.currency).toBe("USD");
    expect(prisma.exchangeAudit.create).toHaveBeenCalled();
  });
});
