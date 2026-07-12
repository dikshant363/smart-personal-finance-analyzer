import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUnifiedTimeline } from "./aggregator";
import { generatePlanningSuggestions, getAiEventExplanation } from "./planning";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
    },
    recurringItem: {
      findMany: vi.fn(),
    },
    goal: {
      findMany: vi.fn(),
    },
    recommendation: {
      findMany: vi.fn(),
    },
    scoreHistory: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("../score/engine", () => ({
  calculateHealthScore: vi.fn().mockResolvedValue({
    score: 82,
    band: "Excellent",
    calculatedAt: "2026-07-15T00:00:00.000Z",
  }),
}));

describe("Financial Timeline & Planning Engine (FTPE) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates transaction and recurring items into timeline", async () => {
    (prisma.transaction.findMany as any).mockResolvedValueOnce([
      { id: "tx1", amount: 45.5, type: "Expense", description: "Market", date: new Date("2026-07-02"), category: { name: "Food" } },
    ]);

    (prisma.recurringItem.findMany as any).mockResolvedValueOnce([
      { id: "rec1", amount: 15.0, type: "Expense", name: "Netflix", frequency: "Monthly", expectedNextDate: new Date("2026-07-10"), status: "Active" },
    ]);

    (prisma.goal.findMany as any).mockResolvedValueOnce([]);
    (prisma.recommendation.findMany as any).mockResolvedValueOnce([]);

    const events = await getUnifiedTimeline(
      "u1",
      new Date("2026-07-01"),
      new Date("2026-07-20")
    );

    // Should include: 1 transaction, 1 recurring item projection, and 1 health score changes event
    expect(events.length).toBe(3);
    expect(events.some((e) => e.type === "Expense")).toBe(true);
    expect(events.some((e) => e.type === "Recurring")).toBe(true);
  });

  it("triggers planning recommendations for large upcoming bills", () => {
    const mockEvents: any[] = [
      { id: "1", title: "Rent", type: "Recurring", status: "Scheduled", amount: 1200, timestamp: new Date("2026-07-10") },
    ];

    const suggestions = generatePlanningSuggestions(mockEvents);

    expect(suggestions.length).toBe(1);
    expect(suggestions[0].type).toBe("defer_spending");
    expect(suggestions[0].associatedEventId).toBe("1");
  });

  it("provides structured stubs explaining events", () => {
    const mockIncome: any = { type: "Income", title: "Monthly Salary" };
    const mockRecurring: any = { type: "Recurring", title: "Gym Membership", amount: 20 };

    const incExpl = getAiEventExplanation(mockIncome);
    const recExpl = getAiEventExplanation(mockRecurring);

    expect(incExpl.whyItMatters).toContain("Income is the core driver");
    expect(recExpl.preparationAdvice).toContain("Allocate 20 in your weekly planning");
  });
});
