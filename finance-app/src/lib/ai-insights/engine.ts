import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { buildAiContext } from "./context-builder";
import { buildPrompt, getPromptVersion } from "./prompt-builder";
import { saveAiInsight, getAiInsightFeed as getAiInsightsFromDb } from "./repository";
import type { AiInsight, AiInsightInput, InsightType, Db } from "./types";

const FALLBACK_TITLES: Record<InsightType, string> = {
  summary: "Financial Summary",
  forecast: "30-Day Forecast Preview",
  recommendation: "Top Recommendation",
  health: "Financial Health Overview",
  trend: "Spending Trend",
  achievement: "Recent Achievement",
  risk: "Risk Alert",
  education: "Financial Tip",
  budget: "Budget Insight",
  savings: "Savings Insight",
};

const FALLBACK_SUMMARIES: Record<InsightType, string> = {
  summary: "Based on your recent data, your financial picture shows areas to monitor and opportunities to improve.",
  forecast: "Your 30-day projection suggests continued patterns in your cash flow.",
  recommendation: "There is a recommendation available that could help improve your financial health.",
  health: "Your financial health score reflects your current financial habits.",
  trend: "Recent spending patterns show both consistencies and changes worth noting.",
  achievement: "You have shown positive financial behaviors worth recognizing.",
  risk: "Some areas of your finances may need closer attention.",
  education: "Understanding these patterns can help you make better financial decisions.",
  budget: "Your budget and spending patterns offer insights for better planning.",
  savings: "There may be opportunities to optimize your savings based on current patterns.",
};

function createFallbackInsight(input: AiInsightInput): AiInsight {
  const now = new Date().toISOString();
  return {
    userId: input.userId,
    type: input.type,
    title: FALLBACK_TITLES[input.type],
    summary: FALLBACK_SUMMARIES[input.type],
    detail: "We couldn't generate a detailed insight right now. Please check back later.",
    contextVersion: "1.0.0",
    promptVersion: getPromptVersion(),
    confidence: 0.3,
    feedback: null,
    dismissed: false,
    generatedAt: now,
  };
}

export async function generateAiInsight(input: AiInsightInput, db: Db = prisma): Promise<AiInsight> {
  try {
    const context = input.context && Object.keys(input.context).length > 0 ? input.context : await buildAiContext(input.userId, db);
    const { system, user } = buildPrompt(input.type, context);

    const provider = getAIProvider();
    const result = await provider.generateSingleInsight(system, user);

    const content = typeof result.content === "string" ? result.content : "";
    let confidence = typeof result.confidence === "number" ? Math.max(0, Math.min(1, result.confidence)) : 0.5;

    let title = FALLBACK_TITLES[input.type];
    let summary = FALLBACK_SUMMARIES[input.type];
    let detail = content || "No detail available.";

    let parsed: { title?: string; summary?: string; detail?: string; confidence?: number } | null = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      // content is plain text, use as detail
    }

    if (parsed) {
      if (parsed.title) title = String(parsed.title).slice(0, 200);
      if (parsed.summary) summary = String(parsed.summary).slice(0, 500);
      if (parsed.detail) detail = String(parsed.detail).slice(0, 2000);
      if (typeof parsed.confidence === "number") confidence = Math.max(0, Math.min(1, parsed.confidence));
    }

    const insight: AiInsight = {
      userId: input.userId,
      type: input.type,
      title,
      summary,
      detail,
      contextVersion: "1.0.0",
      promptVersion: getPromptVersion(),
      confidence,
      feedback: null,
      dismissed: false,
      generatedAt: new Date().toISOString(),
    };

    return saveAiInsight(insight, db);
  } catch (error) {
    const fallback = createFallbackInsight(input);
    return saveAiInsight(fallback, db);
  }
}

export async function generateAiInsights(userId: string, types: InsightType[], db: Db = prisma): Promise<AiInsight[]> {
  const context = await buildAiContext(userId, db);
  const results: AiInsight[] = [];
  for (const type of types) {
    const insight = await generateAiInsight({ userId, type, context }, db);
    results.push(insight);
  }
  return results;
}

export async function getAiInsightFeed(userId: string, db: Db = prisma): Promise<AiInsight[]> {
  return getAiInsightsFromDb(userId, db);
}

export async function refreshAiInsights(userId: string, db: Db = prisma): Promise<AiInsight[]> {
  await db.aiInsight.updateMany({
    where: { userId },
    data: { dismissed: true },
  });

  const context = await buildAiContext(userId, db);
  const allTypes: InsightType[] = ["summary", "forecast", "recommendation", "health", "trend", "achievement", "risk", "education", "budget", "savings"];
  const results: AiInsight[] = [];
  for (const type of allTypes) {
    const insight = await generateAiInsight({ userId, type, context }, db);
    results.push(insight);
  }
  return results;
}
