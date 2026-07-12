export type RecCategory =
  | "savings" | "budget_optimization" | "expense_reduction" | "cashflow"
  | "health_improvement" | "emergency_fund" | "income_opportunity" | "subscription"
  | "recurring_optimization" | "category_optimization" | "lifestyle" | "seasonal"
  | "risk_warning" | "positive" | "future_planning";
export type RecPriority = "critical" | "high" | "medium" | "low";
export type RecDifficulty = "easy" | "moderate" | "hard";
export type RecConfidence = "very_high" | "high" | "medium" | "low";
export type RecStatus = "active" | "accepted" | "dismissed" | "completed" | "archived";

export interface RuleRecommendation {
  key: string;
  category: RecCategory;
  title: string;
  summary: string;
  reason: string;
  evidence: string;
  monthlySavings: number;
  annualSavings: number;
  scoreImpact: number;
  difficulty: RecDifficulty;
  priority: RecPriority;
  confidence: RecConfidence;
  action: string;
  expiresAt?: string;
}
export interface StoredRecommendation extends RuleRecommendation {
  id: string;
  userId: string;
  explanation: string;
  status: RecStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  acceptedAt: string | null;
  completedAt: string | null;
}
export interface RecommendationAnalytics {
  total: number; accepted: number; completed: number; dismissed: number;
  acceptanceRate: number; completionRate: number;
  avgMonthlySavings: number; avgScoreImpact: number;
  topCategories: { category: RecCategory; count: number }[];
}
export interface RecFilters {
  priority?: RecPriority; category?: RecCategory; difficulty?: RecDifficulty;
  status?: RecStatus; minSavings?: number;
}
export type RecSort = "priority" | "savings" | "scoreImpact" | "newest" | "oldest";
export const PRIORITY_RANK: Record<RecPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
