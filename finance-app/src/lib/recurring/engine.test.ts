import { describe, it, expect, vi, beforeEach } from "vitest";
import { detectRecurringTransactions } from "./detection";
import { getUpcomingPayments, checkAndGenerateReminders } from "./schedule";
import { generateRecurringOptimizations } from "./optimization";
import { getRecurringAnalytics } from "./analytics";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    recurringItem: {
      findMany: vi.fn(),
    },
    notificationCandidate: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("Recurring Intelligence Engine (RFIE) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects monthly recurring transaction patterns", async () => {
    const mockTxs = [
      { id: "1", description: "Netflix", amount: 15.99, type: "Expense", date: new Date("2026-01-01"), categoryId: "c1" },
      { id: "2", description: "Netflix", amount: 15.99, type: "Expense", date: new Date("2026-02-01"), categoryId: "c1" },
      { id: "3", description: "Netflix", amount: 15.99, type: "Expense", date: new Date("2026-03-03"), categoryId: "c1" },
    ];

    (prisma.transaction.findMany as any).mockResolvedValueOnce(mockTxs);

    const result = await detectRecurringTransactions("u1");

    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Netflix");
    expect(result[0].frequency).toBe("Monthly");
    expect(result[0].amount).toBe(15.99);
    expect(result[0].confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("projects upcoming calendar events correctly", async () => {
    const mockItems = [
      {
        id: "rec1",
        name: "Rent",
        amount: 1500,
        type: "Expense",
        frequency: "Monthly",
        expectedNextDate: new Date("2026-07-01"),
        lastPaidDate: null,
        status: "Active",
        category: { name: "Housing" },
      },
    ];

    (prisma.recurringItem.findMany as any).mockResolvedValue(mockItems);

    const upcoming = await getUpcomingPayments(
      "u1",
      new Date("2026-07-01"),
      new Date("2026-08-31")
    );

    // Should project occurrences for July 1 and Aug 1
    expect(upcoming.length).toBe(2);
    expect(upcoming[0].dueDate.getMonth()).toBe(6); // July
    expect(upcoming[1].dueDate.getMonth()).toBe(7); // August
  });

  it("generates optimizations for monthly items with switch-to-annual recommendations", async () => {
    const mockItems = [
      {
        id: "rec1",
        name: "Premium Gym",
        amount: 50,
        type: "Expense",
        frequency: "Monthly",
        expectedNextDate: new Date("2026-07-01"),
        lastPaidDate: new Date("2026-06-01"),
        status: "Active",
        currency: "USD",
      },
    ];

    (prisma.recurringItem.findMany as any).mockResolvedValue(mockItems);

    const opts = await generateRecurringOptimizations("u1");

    expect(opts.length).toBe(1);
    expect(opts[0].type).toBe("annual_plan");
    expect(opts[0].potentialSavings).toBe(120); // 20% of 50 * 12
  });

  it("calculates recurring commitment analytics", async () => {
    const mockItems = [
      {
        id: "rec1",
        name: "Rent",
        amount: 1000,
        type: "Expense",
        frequency: "Monthly",
        expectedNextDate: new Date("2026-07-01"),
        lastPaidDate: null,
        status: "Active",
      },
      {
        id: "rec2",
        name: "Salary",
        amount: 4000,
        type: "Income",
        frequency: "Monthly",
        expectedNextDate: new Date("2026-07-01"),
        lastPaidDate: null,
        status: "Active",
      },
    ];

    (prisma.recurringItem.findMany as any).mockResolvedValue(mockItems);
    (prisma.transaction.groupBy as any).mockResolvedValueOnce([
      { type: "Expense", _sum: { amount: 6000 } }, // 2000/mo avg total expense
    ]);

    const analytics = await getRecurringAnalytics("u1");

    expect(analytics.monthlyRecurringExpenses).toBe(1000);
    expect(analytics.recurringIncome).toBe(4000);
    expect(analytics.recurringExpenseRatio).toBe(50); // 1000 / 2000 * 100
  });
});
