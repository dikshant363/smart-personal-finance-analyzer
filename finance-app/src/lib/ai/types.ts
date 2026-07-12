export type InsightSeverity = "info" | "positive" | "warning" | "critical";
export interface Insight {
  id: string;
  title: string;
  detail: string;
  severity: InsightSeverity;
  relatedMetric?: string;
}
export interface InsightContext {
  currency: string;
  monthLabel: string;
  totals: { income: number; expense: number; net: number };
  recentTransactions: { description: string | null; amount: number; type: "Income" | "Expense"; category: string | null; date: string }[];
  budgets: { name: string; amount: number; spent: number }[];
}
export interface InsightResult {
  insights: Insight[];
  confidence: number;
  note: string;
  generatedAt: string;
}
export interface AIProvider {
  name: string;
  generateInsights(ctx: InsightContext): Promise<InsightResult>;
  generateSingleInsight(system: string, user: string): Promise<{ content: string; confidence: number }>;
}
