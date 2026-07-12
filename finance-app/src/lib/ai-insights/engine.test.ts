import { describe, it, expect, vi } from "vitest";
import { buildAiContext } from "./context-builder";
import { buildPrompt, getPromptVersion, PROMPT_VERSION } from "./prompt-builder";
import { generateAiInsight, generateAiInsights, getAiInsightFeed, refreshAiInsights } from "./engine";
import { submitFeedback, dismissInsight } from "./feedback";
import { saveAiInsight, getAiInsightFeed as getAiInsightsFromDb, submitAiFeedback, dismissAiInsight, getAiInsightStats } from "./repository";
import type { AiInsightInput, InsightType } from "./types";

const mockPrisma = () => ({
  user: { findUnique: vi.fn() },
  profile: { findUnique: vi.fn() },
  transaction: { findMany: vi.fn(), groupBy: vi.fn(), aggregate: vi.fn() },
  category: { findMany: vi.fn() },
  budget: { findMany: vi.fn() },
  scoreHistory: { findFirst: vi.fn() },
  recommendation: { findMany: vi.fn() },
  forecast: { findFirst: vi.fn() },
  $queryRaw: vi.fn(),
  aiInsight: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
  },
});

describe("buildAiContext", () => {
  it("returns structured context with all engines", async () => {
    const db = mockPrisma();
    db.user.findUnique.mockResolvedValue({ name: "Test User" });
    db.profile.findUnique.mockResolvedValue({ currency: "USD" });
    db.transaction.findMany.mockResolvedValue([]);
    db.transaction.groupBy.mockResolvedValue([]);
    db.transaction.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    db.category.findMany.mockResolvedValue([]);
    db.budget.findMany.mockResolvedValue([]);
    db.scoreHistory.findFirst.mockResolvedValue(null);
    db.recommendation.findMany.mockResolvedValue([]);
    db.forecast.findFirst.mockResolvedValue(null);
    db.$queryRaw.mockResolvedValue([]);

    const context = await buildAiContext("user-1", db as any);

    expect(context.profile.currency).toBe("USD");
    expect(context.profile.name).toBe("Test User");
    expect(context.healthScore).toBeDefined();
    expect(context.healthScore?.score).toBeGreaterThanOrEqual(0);
    expect(context.healthScore?.score).toBeLessThanOrEqual(100);
    expect(context.analysis).toBeDefined();
    expect(Array.isArray(context.analysis?.insights)).toBe(true);
    expect(Array.isArray(context.analysis?.alerts)).toBe(true);
    expect(Array.isArray(context.recommendations)).toBe(true);
    expect(context.forecast).toBeDefined();
    expect(context.recentTransactions).toBeDefined();
    expect(Array.isArray(context.recentTransactions)).toBe(true);
  });
});

describe("buildPrompt", () => {
  const types: InsightType[] = [
    "summary", "forecast", "recommendation", "health",
    "trend", "achievement", "risk", "education", "budget", "savings",
  ];

  it("returns valid prompts for all insight types", () => {
    const context = {
      profile: { currency: "USD" },
      healthScore: { score: 75, band: "Good", trend: 5 },
      analysis: {
        insights: [{ title: "Test", summary: "Test summary", priority: "medium" }],
        alerts: [{ title: "Alert", severity: "medium", detail: "Detail" }],
      },
      recommendations: [{ title: "Rec", summary: "Rec summary", priority: "high", monthlySavings: 100 }],
      forecast: { period: "30d", scenario: "expected", summary: { changePercent: 2.5 }, risks: ["Risk"] },
      recentTransactions: [{ description: "Tx", amount: 50, type: "Expense", date: "2024-01-01" }],
    };

    for (const type of types) {
      const prompt = buildPrompt(type, context);
      expect(prompt.system).toBeTruthy();
      expect(prompt.user).toBeTruthy();
      expect(typeof prompt.system).toBe("string");
      expect(typeof prompt.user).toBe("string");
    }
  });

  it("getPromptVersion returns 2.0.0", () => {
    expect(getPromptVersion()).toBe("2.0.0");
    expect(PROMPT_VERSION).toBe("2.0.0");
  });
});

describe("repository", () => {
  it("saves and retrieves insight", async () => {
    const db = mockPrisma();
    const created = { id: "insight-1", userId: "u1", type: "summary", title: "T", summary: "S", detail: "D", contextVersion: "1.0.0", promptVersion: "1.0.0", confidence: 0.8, feedback: null, dismissed: false, generatedAt: new Date("2024-01-01T00:00:00Z") };
    db.aiInsight.create.mockResolvedValue(created);

    const insight = await saveAiInsight({
      userId: "u1",
      type: "summary",
      title: "T",
      summary: "S",
      detail: "D",
      contextVersion: "1.0.0",
      promptVersion: "1.0.0",
      confidence: 0.8,
      feedback: null,
      dismissed: false,
      generatedAt: "2024-01-01T00:00:00Z",
    }, db as any);

    expect(insight.id).toBe("insight-1");
  });

  it("retrieves feed", async () => {
    const db = mockPrisma();
    db.aiInsight.findMany.mockResolvedValue([{ id: "1", userId: "u1", type: "summary", title: "T", summary: "S", detail: "D", contextVersion: "1.0.0", promptVersion: "1.0.0", confidence: 0.8, feedback: null, dismissed: false, generatedAt: new Date() }]);

    const feed = await getAiInsightsFromDb("u1", db as any);
    expect(feed.length).toBe(1);
    expect(feed[0].id).toBe("1");
  });

  it("submits feedback", async () => {
    const db = mockPrisma();
    db.aiInsight.findUnique.mockResolvedValue({ id: "1", userId: "u1" });
    db.aiInsight.update.mockResolvedValue({});

    await submitAiFeedback("1", "u1", "helpful", db as any);
    expect(db.aiInsight.update).toHaveBeenCalledWith({ where: { id: "1" }, data: { feedback: "helpful" } });
  });

  it("dismisses insight", async () => {
    const db = mockPrisma();
    db.aiInsight.findUnique.mockResolvedValue({ id: "1", userId: "u1" });
    db.aiInsight.update.mockResolvedValue({});

    await dismissAiInsight("1", "u1", db as any);
    expect(db.aiInsight.update).toHaveBeenCalledWith({ where: { id: "1" }, data: { dismissed: true } });
  });

  it("returns stats", async () => {
    const db = mockPrisma();
    db.aiInsight.count.mockResolvedValueOnce(10).mockResolvedValueOnce(5).mockResolvedValueOnce(2).mockResolvedValueOnce(3);

    const stats = await getAiInsightStats("u1", db as any);
    expect(stats).toEqual({ total: 10, helpful: 5, notHelpful: 2, dismissed: 3 });
  });
});

describe("feedback", () => {
  it("submits feedback via wrapper", async () => {
    const db = mockPrisma();
    db.aiInsight.findUnique.mockResolvedValue({ id: "1", userId: "u1" });
    db.aiInsight.update.mockResolvedValue({});

    await submitFeedback("1", "u1", "helpful", db as any);
    expect(db.aiInsight.update).toHaveBeenCalled();
  });

  it("dismisses insight via wrapper", async () => {
    const db = mockPrisma();
    db.aiInsight.findUnique.mockResolvedValue({ id: "1", userId: "u1" });
    db.aiInsight.update.mockResolvedValue({});

    await dismissInsight("1", "u1", db as any);
    expect(db.aiInsight.update).toHaveBeenCalledWith({ where: { id: "1" }, data: { dismissed: true } });
  });
});

describe("engine", () => {
  it("generates insight with mock provider fallback", async () => {
    const db = mockPrisma();
    db.user.findUnique.mockResolvedValue({ name: "Test" });
    db.profile.findUnique.mockResolvedValue({ currency: "USD" });
    db.transaction.findMany.mockResolvedValue([]);
    db.transaction.groupBy.mockResolvedValue([]);
    db.transaction.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    db.category.findMany.mockResolvedValue([]);
    db.budget.findMany.mockResolvedValue([]);
    db.scoreHistory.findFirst.mockResolvedValue(null);
    db.recommendation.findMany.mockResolvedValue([]);
    db.forecast.findFirst.mockResolvedValue(null);
    db.$queryRaw.mockResolvedValue([]);
    db.aiInsight.create.mockResolvedValue({ id: "insight-1", generatedAt: new Date() });

    const insight = await generateAiInsight({ userId: "u1", type: "summary", context: {} }, db as any);

    expect(insight.id).toBe("insight-1");
    expect(insight.type).toBe("summary");
    expect(insight.confidence).toBeGreaterThanOrEqual(0);
  });

  it("generates multiple insights", async () => {
    const db = mockPrisma();
    db.user.findUnique.mockResolvedValue({ name: "Test" });
    db.profile.findUnique.mockResolvedValue({ currency: "USD" });
    db.transaction.findMany.mockResolvedValue([]);
    db.transaction.groupBy.mockResolvedValue([]);
    db.transaction.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    db.category.findMany.mockResolvedValue([]);
    db.budget.findMany.mockResolvedValue([]);
    db.scoreHistory.findFirst.mockResolvedValue(null);
    db.recommendation.findMany.mockResolvedValue([]);
    db.forecast.findFirst.mockResolvedValue(null);
    db.$queryRaw.mockResolvedValue([]);
    db.aiInsight.create.mockResolvedValue({ id: "insight-1", generatedAt: new Date() });

    const insights = await generateAiInsights("u1", ["summary", "health"], db as any);
    expect(insights.length).toBe(2);
    expect(insights[0].type).toBe("summary");
    expect(insights[1].type).toBe("health");
  });

  it("retrieves feed", async () => {
    const db = mockPrisma();
    db.aiInsight.findMany.mockResolvedValue([]);

    const feed = await getAiInsightFeed("u1", db as any);
    expect(Array.isArray(feed)).toBe(true);
  });

  it("refreshes insights by dismissing and regenerating", async () => {
    const db = mockPrisma();
    db.user.findUnique.mockResolvedValue({ name: "Test" });
    db.profile.findUnique.mockResolvedValue({ currency: "USD" });
    db.transaction.findMany.mockResolvedValue([]);
    db.transaction.groupBy.mockResolvedValue([]);
    db.transaction.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    db.category.findMany.mockResolvedValue([]);
    db.budget.findMany.mockResolvedValue([]);
    db.scoreHistory.findFirst.mockResolvedValue(null);
    db.recommendation.findMany.mockResolvedValue([]);
    db.forecast.findFirst.mockResolvedValue(null);
    db.$queryRaw.mockResolvedValue([]);
    db.aiInsight.updateMany.mockResolvedValue({ count: 0 });
    db.aiInsight.create.mockResolvedValue({ id: "insight-1", generatedAt: new Date() });

    const insights = await refreshAiInsights("u1", db as any);
    expect(insights.length).toBe(10);
    expect(db.aiInsight.updateMany).toHaveBeenCalledWith({ where: { userId: "u1" }, data: { dismissed: true } });
  });
});
