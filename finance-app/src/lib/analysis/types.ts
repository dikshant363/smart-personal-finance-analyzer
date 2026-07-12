export type InsightCategory = "spending" | "income" | "savings" | "budget" | "cashflow" | "anomaly" | "trend" | "category";
export type InsightImpact = "low" | "medium" | "high";
export type InsightPriority = "low" | "medium" | "high" | "critical";
export type Confidence = "low" | "medium" | "high" | "very_high";

export interface Insight {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  evidence: string;
  confidence: Confidence;
  impact: InsightImpact;
  priority: InsightPriority;
  suggestedAction: string;
  category: InsightCategory;
  metric?: number;
}
export interface Alert {
  id: string;
  title: string;
  severity: InsightPriority;
  detail: string;
  evidence: string;
}
export interface TrendPoint { period: string; label: string; value: number; }
export interface Series { name: string; points: TrendPoint[]; }
export interface AnalysisTrends {
  daily: Series;
  weekly: Series;
  monthly: Series;
  quarterly: Series;
  yearly: Series;
  incomeVsExpense: { income: Series; expense: Series };
  savings: Series;
  cashflow: Series;
  category: { name: string; series: Series }[];
}
export interface AnalysisResult {
  insights: Insight[];
  alerts: Alert[];
  trends: AnalysisTrends;
  generatedAt: string;
}
