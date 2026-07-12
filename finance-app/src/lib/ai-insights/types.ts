export type InsightType =
  | "summary" | "forecast" | "recommendation"
  | "health" | "trend" | "achievement"
  | "risk" | "education" | "budget" | "savings";

export type InsightFeedback = "helpful" | "not_helpful" | null;

export interface AiInsightInput {
  userId: string;
  type: InsightType;
  context: {
    profile: { currency: string; name?: string };
    healthScore?: { score: number; band: string; trend: number };
    analysis?: { insights: Array<{ title: string; summary: string; priority: string }>; alerts: Array<{ title: string; severity: string; detail: string }> };
    recommendations?: Array<{ title: string; summary: string; priority: string; monthlySavings: number }>;
    forecast?: { period: string; scenario: string; summary: { changePercent: number }; risks: string[] };
    recentTransactions?: Array<{ description: string; amount: number; type: string; date: string }>;
  };
}

export interface AiInsight {
  id?: string;
  userId: string;
  type: InsightType;
  title: string;
  summary: string;
  detail: string;
  contextVersion: string;
  promptVersion: string;
  confidence: number;
  feedback: InsightFeedback;
  dismissed: boolean;
  generatedAt: string;
}

export interface InsightFeedbackInput {
  insightId: string;
  feedback: InsightFeedback;
}

export type Db = typeof import("@/lib/prisma").prisma;
