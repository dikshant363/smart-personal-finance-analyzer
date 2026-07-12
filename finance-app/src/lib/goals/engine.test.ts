import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateGoalMetrics } from "./engine";
import { getGoalForecasts } from "./forecast";
import { generateGoalRecommendations } from "./recommendations";
import { getGoalAnalytics } from "./analytics";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    transaction: {
      groupBy: vi.fn(),
    },
    goal: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/analysis/analyze", () => ({
  analyzeSpending: vi.fn().mockResolvedValue({ insights: [{ title: "Top discretionary category" }] }),
}));

describe("Goal Engine", () => {
  it("calculates goal progress percent and remaining amount", () => {
    const result = calculateGoalMetrics({
      targetAmount: 1000,
      currentAmount: 250,
      deadline: null,
      createdAt: new Date(),
      estimatedMonthlyContribution: 100,
      actualMonthlyContribution: 120,
      status: "active",
    });

    expect(result.progressPercent).toBe(25);
    expect(result.remainingAmount).toBe(750);
    expect(result.remainingMonthsEstimated).toBe(7.5);
    expect(result.remainingMonthsActual).toBe(6.25);
  });

  it("calculates required savings for deadlines", () => {
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 10);

    const result = calculateGoalMetrics({
      targetAmount: 1000,
      currentAmount: 0,
      deadline,
      createdAt: new Date(),
      estimatedMonthlyContribution: 0,
      actualMonthlyContribution: 0,
      status: "active",
    });

    expect(result.averageMonthlySavingRequired).toBeCloseTo(100, -1);
  });

  it("handles behind_schedule status when progress is slow", () => {
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 5);

    const createdAt = new Date();
    createdAt.setMonth(createdAt.getMonth() - 5); // Should have progressed 50% through the timeline

    const result = calculateGoalMetrics({
      targetAmount: 1000,
      currentAmount: 100, // only 10% progress (below 50% target)
      deadline,
      createdAt,
      estimatedMonthlyContribution: 50,
      actualMonthlyContribution: 50,
      status: "active",
    });

    expect(result.status).toBe("behind_schedule");
  });

  it("transitions to completed status automatically", () => {
    const result = calculateGoalMetrics({
      targetAmount: 1000,
      currentAmount: 1000,
      deadline: null,
      createdAt: new Date(),
      estimatedMonthlyContribution: 0,
      actualMonthlyContribution: 0,
      status: "active",
    });

    expect(result.status).toBe("completed");
  });
});

describe("Goal Recommendations Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a savings increase recommendation when a goal is behind schedule", async () => {
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 5);

    const mockGoals = [
      {
        id: "g1",
        userId: "u1",
        name: "Car Fund",
        description: "",
        targetAmount: 5000,
        currentAmount: 500,
        currency: "USD",
        deadline,
        priority: "high",
        status: "behind_schedule",
        type: "vehicle",
        estimatedMonthlyContribution: 100,
        actualMonthlyContribution: 100,
        createdAt: new Date(Date.now() - 5 * 30 * 24 * 3600 * 1000),
        milestones: [],
        contributions: [],
      },
    ];

    (prisma.goal.findMany as any).mockResolvedValue(mockGoals);
    (prisma.transaction.groupBy as any).mockResolvedValue([]);

    const recs = await generateGoalRecommendations("u1");
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].type).toBe("savings_increase");
  });
});

describe("Goal Analytics Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates goal counts and progress ratios", async () => {
    const mockGoals = [
      {
        id: "g1",
        name: "Emergency",
        targetAmount: 2000,
        currentAmount: 1000,
        currency: "USD",
        deadline: null,
        priority: "critical",
        status: "active",
        type: "emergency_fund",
        estimatedMonthlyContribution: 100,
        actualMonthlyContribution: 100,
        createdAt: new Date(),
        milestones: [],
        contributions: [],
      },
    ];

    (prisma.goal.findMany as any).mockResolvedValueOnce(mockGoals);

    const analytics = await getGoalAnalytics("u1");
    expect(analytics.totalTarget).toBe(2000);
    expect(analytics.totalSaved).toBe(1000);
    expect(analytics.overallProgress).toBe(50);
    expect(analytics.statusCounts.active).toBe(1);
  });
});
