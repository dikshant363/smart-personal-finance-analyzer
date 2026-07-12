import { EmergencyMetrics } from "./engine";

export interface EmergencyRecommendation {
  type: string;
  title: string;
  summary: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  potentialSavings: number;
}

export function generateEmergencyRecommendations(
  metrics: EmergencyMetrics,
  currency = "USD"
): EmergencyRecommendation[] {
  const recommendations: EmergencyRecommendation[] = [];

  const targetDiff = metrics.emergencyFundTarget - metrics.currentEmergencyFund;

  // 1. Fund is below target
  if (targetDiff > 0) {
    const suggestedIncrease = Math.min(targetDiff, Math.max(50, metrics.savingsRate * 0.2));
    recommendations.push({
      type: "rebuild_fund",
      title: "Boost Monthly Emergency Contributions",
      summary: `Increase contributions by ${currency} ${Math.round(suggestedIncrease)}/month.`,
      explanation: `Your current emergency fund of ${currency} ${metrics.currentEmergencyFund} is short of your ${currency} ${metrics.emergencyFundTarget} target. Allocating an extra ${currency} ${Math.round(suggestedIncrease)} per month will help you achieve full coverage sooner.`,
      difficulty: "medium",
      potentialSavings: suggestedIncrease,
    });
  }

  // 2. Critical coverage status (less than 3 months covered)
  if (metrics.coverageDurationMonths < 3) {
    recommendations.push({
      type: "prioritize_reserve",
      title: "Prioritize Emergency Savings over Other Goals",
      summary: "Pause other investment goals to secure essential living reserves.",
      explanation: `With only ${metrics.coverageDurationMonths} months of essential expenses covered, your resilience score is low. Consider pausing contributions to other discretionary goals (like travel or electronics) until you have a 3-month survival buffer.`,
      difficulty: "easy",
      potentialSavings: 0,
    });
  }

  // 3. Surplus savings available (fund exceeded target)
  if (targetDiff < 0) {
    const surplus = Math.abs(targetDiff);
    recommendations.push({
      type: "reallocate_surplus",
      title: "Reallocate Surplus Cash to Investments",
      summary: `Reallocate ${currency} ${Math.round(surplus)} to goals or high-yield assets.`,
      explanation: `Your emergency reserve has exceeded its target by ${currency} ${Math.round(surplus)}. Since these funds are sitting in cash, you should consider moving the surplus into interest-bearing instruments or long-term financial goals.`,
      difficulty: "easy",
      potentialSavings: 0,
    });
  }

  // 4. Low/Negative savings rate
  if (metrics.savingsRate <= 0) {
    recommendations.push({
      type: "expense_reduction",
      title: "Audit Non-Essential Expenses",
      summary: "Trim discretionary spending to create a positive savings rate.",
      explanation: "Your current monthly expenses are equal to or exceed your monthly income. This limits your ability to build reserves and poses a high default risk. Audit your dining, entertainment, and shopping categories to unlock budget space.",
      difficulty: "hard",
      potentialSavings: 150,
    });
  }

  return recommendations;
}
