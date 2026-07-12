import type { ScoreResult, ScoreDimension } from "@/lib/score/types";
import type { AnalysisResult, Alert } from "@/lib/analysis/types";
import type { RecCategory, RecPriority, RecDifficulty, RecConfidence, RecStatus, RuleRecommendation, RecFilters, RecSort, PRIORITY_RANK } from "./types";

export interface RuleInput {
  score: ScoreResult;
  analysis: AnalysisResult;
  monthlyIncome: number;
  monthlyExpense: number;
  currency: string;
}

function mapDimToCategory(key: string): RecCategory {
  if (key === "savings_ratio") return "savings";
  if (key === "emergency_fund") return "emergency_fund";
  if (key === "recurring_burden") return "recurring_optimization";
  if (key.includes("saving")) return "savings";
  if (key.includes("budget")) return "budget_optimization";
  if (key.includes("category")) return "category_optimization";
  if (key.includes("expense")) return "expense_reduction";
  if (key.includes("recurring") || key.includes("subscription")) return "recurring_optimization";
  if (key.includes("cashflow")) return "cashflow";
  if (key.includes("income")) return "income_opportunity";
  return "budget_optimization";
}

function parseNumberFromText(text: string): number {
  const match = text.match(/\d+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function generateRuleRecommendations(input: RuleInput): RuleRecommendation[] {
  const { score, analysis, monthlyIncome, monthlyExpense } = input;
  const recs: RuleRecommendation[] = [];

  for (const dim of score.dimensions) {
    if (dim.score >= dim.ideal) continue;
    if (dim.weight < 5) continue;

    const category = mapDimToCategory(dim.key);
    const gap = Math.max(0, dim.ideal - dim.current);
    const monthlySavings = monthlyIncome > 0 ? round2((gap / 100) * monthlyIncome) : 0;
    const scoreImpact = Math.round(((100 - dim.score) * dim.weight) / 100);

    const priority: RecPriority = gap > 30 ? "high" : gap > 15 ? "medium" : "low";
    const difficulty: RecDifficulty = priority === "high" ? "hard" : priority === "medium" ? "moderate" : "easy";
    const confidence: RecConfidence = gap >= 40 ? "very_high" : gap >= 20 ? "high" : "medium";

    recs.push({
      key: `dim_${dim.key}`,
      category,
      title: `Improve your ${dim.name}`,
      summary: `Your ${dim.name} is at ${dim.currentLabel}. Improving it to ${dim.idealLabel} can help your financial health.`,
      reason: `Score gap of ${gap} points between current and ideal.`,
      evidence: `Current: ${dim.current} (${dim.currentLabel}), Ideal: ${dim.ideal} (${dim.idealLabel}).`,
      monthlySavings,
      annualSavings: round2(monthlySavings * 12),
      scoreImpact: Math.max(0, scoreImpact),
      difficulty,
      priority,
      confidence,
      action: dim.suggestion,
    });
  }

  for (const dim of score.dimensions) {
    if (dim.key !== "emergency_fund") continue;
    if (dim.score >= dim.ideal) continue;
    const gap = Math.max(0, dim.ideal - dim.current);
    const scoreImpact = Math.round(((100 - dim.score) * 15) / 100);
    const monthlySavings = monthlyIncome > 0 ? round2((gap / 100) * monthlyIncome * 0.5) : 0;
    const priority: RecPriority = dim.score < 40 ? "critical" : "high";

    recs.push({
      key: `dim_emergency_fund`,
      category: "emergency_fund",
      title: `Boost your emergency fund`,
      summary: `Your emergency fund coverage is below ideal. Building it up protects against unexpected expenses.`,
      reason: `Score of ${dim.score} is below ideal of ${dim.ideal}.`,
      evidence: `Current: ${dim.current} (${dim.currentLabel}), Ideal: ${dim.ideal} (${dim.idealLabel}).`,
      monthlySavings,
      annualSavings: round2(monthlySavings * 12),
      scoreImpact: Math.max(0, scoreImpact),
      difficulty: priority === "critical" ? "hard" : "moderate",
      priority,
      confidence: "high",
      action: dim.suggestion,
    });
  }

  for (const dim of score.dimensions) {
    if (dim.key !== "recurring_burden") continue;
    if (dim.score >= dim.ideal) continue;
    const gap = Math.max(0, dim.ideal - dim.current);
    const scoreImpact = Math.round(((100 - dim.score) * 5) / 100);
    const monthlySavings = monthlyIncome > 0 ? round2((gap / 100) * monthlyIncome * 0.1) : 0;

    recs.push({
      key: `dim_recurring_burden`,
      category: "recurring_optimization",
      title: `Reduce recurring burden`,
      summary: `Your recurring payment load is higher than ideal. Reviewing subscriptions could free up cash.`,
      reason: `Score of ${dim.score} is below ideal of ${dim.ideal}.`,
      evidence: `Current: ${dim.current} (${dim.currentLabel}), Ideal: ${dim.ideal} (${dim.idealLabel}).`,
      monthlySavings,
      annualSavings: round2(monthlySavings * 12),
      scoreImpact: Math.max(0, scoreImpact),
      difficulty: "moderate",
      priority: "medium",
      confidence: "medium",
      action: dim.suggestion,
    });
  }

  for (const alert of analysis.alerts) {
    const titleLower = alert.title.toLowerCase();
    if (titleLower.includes("over budget")) {
      const parsed = parseNumberFromText(alert.evidence);
      recs.push({
        key: `alert_over_budget_${alert.id}`,
        category: "budget_optimization",
        title: `Stay within budget limits`,
        summary: `You are currently over budget in an area. Adjusting spending can keep finances on track.`,
        reason: "Budget exceeded.",
        evidence: alert.evidence,
        monthlySavings: parsed > 0 ? round2(parsed) : 0,
        annualSavings: parsed > 0 ? round2(parsed * 12) : 0,
        scoreImpact: 4,
        difficulty: "moderate",
        priority: "high",
        confidence: "high",
        action: "Review and reduce overspending categories to align with budget targets.",
      });
    } else if (titleLower.includes("unusually large purchase")) {
      recs.push({
        key: `alert_large_purchase_${alert.id}`,
        category: "risk_warning",
        title: `Large purchase detected`,
        summary: `An unusually large purchase may impact your cashflow. Consider planning ahead for similar future expenses.`,
        reason: "Outlier transaction detected.",
        evidence: alert.evidence,
        monthlySavings: 0,
        annualSavings: 0,
        scoreImpact: 2,
        difficulty: "easy",
        priority: "medium",
        confidence: "medium",
        action: "Review large purchases and plan ahead for similar future expenses.",
      });
    } else if (titleLower.includes("spending spike")) {
      recs.push({
        key: `alert_spending_spike_${alert.id}`,
        category: "expense_reduction",
        title: `Reduce spending spike`,
        summary: `Spending has spiked recently. Identifying the cause and trimming discretionary expenses can help.`,
        reason: "Unusual increase in spending.",
        evidence: alert.evidence,
        monthlySavings: 0,
        annualSavings: 0,
        scoreImpact: 3,
        difficulty: "moderate",
        priority: "high",
        confidence: "high",
        action: "Identify spike sources and reduce non-essential spending until averages normalize.",
      });
    } else if (titleLower.includes("unusual growth")) {
      const parsed = parseNumberFromText(alert.evidence);
      recs.push({
        key: `alert_unusual_growth_${alert.id}`,
        category: "category_optimization",
        title: `Investigate unusual growth`,
        summary: `A category shows unusual spending growth. Reviewing this category can reveal savings opportunities.`,
        reason: "Category spending growing faster than normal.",
        evidence: alert.evidence,
        monthlySavings: parsed > 0 ? round2(parsed) : 0,
        annualSavings: parsed > 0 ? round2(parsed * 12) : 0,
        scoreImpact: 3,
        difficulty: "moderate",
        priority: "medium",
        confidence: "medium",
        action: "Investigate category growth and set stricter limits or subscriptions where possible.",
      });
    }
  }

  const isExcellent = score.band === "Excellent" || score.band === "Very Good";
  const hasUpExplanation = score.explanations.some(e => e.direction === "up");

  if (isExcellent || hasUpExplanation) {
    const explanationText = score.explanations.find(e => e.direction === "up")?.text || "Your finances are in good shape.";
    recs.push({
      key: "positive",
      category: "positive",
      title: `You're doing great`,
      summary: `Keep up the good work! ${explanationText.slice(0, 120)}${explanationText.length > 120 ? "..." : ""}`,
      reason: "Strong financial performance detected.",
      evidence: explanationText,
      monthlySavings: 0,
      annualSavings: 0,
      scoreImpact: 0,
      difficulty: "easy",
      priority: "low",
      confidence: "very_high",
      action: "Maintain current habits and consider setting higher goals.",
    });
  }

  return recs;
}
