export type ScoreBand = "Excellent" | "Very Good" | "Good" | "Needs Improvement" | "Poor" | "Critical";
export interface ScoreDimension {
  key: string; name: string; current: number; currentLabel: string;
  ideal: number; idealLabel: string; weight: number; score: number;
  contribution: number; suggestion: string;
}
export interface ScoreRecommendation {
  dimension: string; priority: "high" | "medium" | "low";
  potentialGain: number; suggestion: string; current: string; target: string;
}
export interface ScoreExplanation { direction: "up" | "down" | "flat"; text: string; }
export interface ScoreResult {
  score: number; band: ScoreBand; month: string; dimensions: ScoreDimension[];
  recommendations: ScoreRecommendation[]; explanations: ScoreExplanation[];
  estimatedPotentialGain: number; currency: string; calculatedAt: string;
}
export interface ScoreTrendPoint { period: string; score: number; }
export interface ScoreInputs {
  income: number; expense: number; net: number;
  savingsLast3Months: number; expenseLast3Months: number; avgMonthlyExpense: number;
  incomeTxCount: number; incomeAmounts: number[];
  expenseByCategory: { name: string; amount: number }[];
  budgetItems: { amount: number; spent: number }[];
  activeDays: number; daysInWindow: number; currency: string;
}
