import { formatMoney } from "@/lib/currency";
import type {
  ScoreBand,
  ScoreDimension,
  ScoreExplanation,
  ScoreInputs,
  ScoreRecommendation,
} from "./types";

export function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  const variance = values.reduce((a, b) => a + (b - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function scoreFromInputs(inputs: ScoreInputs): {
  dimensions: ScoreDimension[];
  total: number;
} {
  const { currency } = inputs;
  const dimensions: ScoreDimension[] = [];

  // 1. savings_ratio w20
  {
    const cur = inputs.income > 0 ? (inputs.net / inputs.income) * 100 : 0;
    const ideal = 30;
    const score = clamp((cur / ideal) * 100);
    dimensions.push({
      key: "savings_ratio",
      name: "Savings Ratio",
      current: cur,
      currentLabel: `${Math.round(cur)}%`,
      ideal,
      idealLabel: "30%",
      weight: 20,
      score,
      contribution: Math.round((score * 20) / 100),
      suggestion:
        cur < ideal
          ? `Increase monthly savings by ${formatMoney(((ideal - cur) / 100) * inputs.income, currency)} to reach the 30% target.`
          : `Savings target met.`,
    });
  }

  // 2. income_stability w15
  {
    let cur = 0;
    let score = 0;
    const ideal = 80;
    if (inputs.incomeTxCount === 0) {
      cur = 0;
      score = 0;
    } else {
      const m = mean(inputs.incomeAmounts);
      const s = stddev(inputs.incomeAmounts);
      const cv = m > 0 ? s / m : 0;
      score = clamp(100 - cv * 100);
      cur = Math.round(score);
    }
    dimensions.push({
      key: "income_stability",
      name: "Income Stability",
      current: cur,
      currentLabel: `${cur}`,
      ideal,
      idealLabel: "80",
      weight: 15,
      score,
      contribution: Math.round((score * 15) / 100),
      suggestion:
        score < ideal
          ? `Diversify or stabilize income sources.`
          : `Income is stable.`,
    });
  }

  // 3. budget_discipline w15
  {
    let cur = 50;
    let score = 50;
    const ideal = 100;
    if (inputs.budgetItems.length === 0) {
      cur = 50;
      score = 50;
    } else {
      const avg =
        inputs.budgetItems.reduce((acc, item) => {
          const adherence =
            item.spent <= item.amount
              ? 1
              : Math.max(0, 1 - (item.spent / item.amount - 1));
          return acc + adherence;
        }, 0) / inputs.budgetItems.length;
      score = clamp(avg * 100);
      cur = Math.round(avg * 100);
    }
    dimensions.push({
      key: "budget_discipline",
      name: "Budget Discipline",
      current: cur,
      currentLabel: `${cur}`,
      ideal,
      idealLabel: "100",
      weight: 15,
      score,
      contribution: Math.round((score * 15) / 100),
      suggestion:
        score < ideal
          ? `Reduce overspending in over-budget categories.`
          : `Budgets are well managed.`,
    });
  }

  // 4. expense_distribution w10
  {
    const ideal = 40;
    let cur = 0;
    let score: number;
    if (inputs.expense === 0) {
      score = 100;
    } else {
      const shares = inputs.expenseByCategory.map((c) => c.amount / inputs.expense);
      const hhi = shares.reduce((a, s) => a + s * s, 0);
      score = clamp(100 - hhi * 100);
      cur = Math.round(hhi * 100);
    }
    dimensions.push({
      key: "expense_distribution",
      name: "Expense Distribution",
      current: cur,
      currentLabel: `${cur}%`,
      ideal,
      idealLabel: "40%",
      weight: 10,
      score,
      contribution: Math.round((score * 10) / 100),
      suggestion:
        score < ideal
          ? `Spread spending across more categories to reduce concentration.`
          : `Spending is well diversified.`,
    });
  }

  // 5. emergency_fund w15
  {
    const ideal = 3;
    const monthsCovered =
      inputs.avgMonthlyExpense > 0
        ? inputs.savingsLast3Months / inputs.avgMonthlyExpense
        : inputs.savingsLast3Months > 0
        ? 100
        : 0;
    const score = clamp((monthsCovered / 3) * 100);
    const cur = Math.round(monthsCovered * 10) / 10;
    dimensions.push({
      key: "emergency_fund",
      name: "Emergency Fund",
      current: cur,
      currentLabel: `${cur} months`,
      ideal,
      idealLabel: "3 months",
      weight: 15,
      score,
      contribution: Math.round((score * 15) / 100),
      suggestion:
        score < ideal
          ? `Build an emergency fund covering 3 months of expenses (currently ${monthsCovered.toFixed(1)} months).`
          : `Emergency fund target met.`,
    });
  }

  // 6. cash_flow w15
  {
    const ideal = 0;
    let score: number;
    let cur: number;
    if (inputs.income <= 0) {
      score = inputs.net >= 0 ? 100 : 0;
      cur = Math.round(inputs.net);
    } else {
      const ratio = inputs.net / inputs.income;
      score = clamp(50 + ratio * 50);
      cur = Math.round(inputs.net);
    }
    dimensions.push({
      key: "cash_flow",
      name: "Cash Flow",
      current: cur,
      currentLabel: formatMoney(cur, currency),
      ideal,
      idealLabel: "positive",
      weight: 15,
      score,
      contribution: Math.round((score * 15) / 100),
      suggestion:
        inputs.net < 0
          ? `You are running negative cash flow — cut discretionary spending.`
          : `Cash flow is positive.`,
    });
  }

  // 7. recurring_burden w5
  {
    const ideal = 50;
    let cur = 0;
    let score: number;
    if (inputs.expense === 0) {
      score = 100;
    } else {
      const shares = inputs.expenseByCategory
        .map((c) => c.amount / inputs.expense)
        .sort((a, b) => b - a);
      const fixedShare = shares.slice(0, 2).reduce((a, s) => a + s, 0);
      score = clamp(100 - fixedShare * 100);
      cur = Math.round(fixedShare * 100);
    }
    dimensions.push({
      key: "recurring_burden",
      name: "Recurring Burden",
      current: cur,
      currentLabel: `${cur}%`,
      ideal,
      idealLabel: "50%",
      weight: 5,
      score,
      contribution: Math.round((score * 5) / 100),
      suggestion:
        score < ideal
          ? `Review fixed/recurring commitments (rent, subscriptions).`
          : `Recurring burden is manageable.`,
    });
  }

  // 8. consistency w5
  {
    const ratio =
      inputs.daysInWindow > 0 ? inputs.activeDays / inputs.daysInWindow : 0;
    const score = clamp(ratio * 100);
    const cur = inputs.activeDays;
    const ideal = inputs.daysInWindow;
    dimensions.push({
      key: "consistency",
      name: "Consistency",
      current: cur,
      currentLabel: `${cur} days`,
      ideal,
      idealLabel: `${ideal} days`,
      weight: 5,
      score,
      contribution: Math.round((score * 5) / 100),
      suggestion:
        score < ideal ? `Log transactions more consistently.` : `Tracking is consistent.`,
    });
  }

  const total = clamp(
    Math.round(dimensions.reduce((a, d) => a + d.contribution, 0)),
    0,
    100
  );

  return { dimensions, total };
}

export function bandFor(score: number): ScoreBand {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Improvement";
  if (score >= 20) return "Poor";
  return "Critical";
}

export function buildRecommendations(
  dimensions: ScoreDimension[]
): ScoreRecommendation[] {
  const recs = dimensions
    .filter((d) => d.score < d.ideal)
    .map((d) => {
      const gap = (100 - d.score) * d.weight;
      const priority: "high" | "medium" | "low" =
        gap > 8 ? "high" : gap > 3 ? "medium" : "low";
      return {
        dimension: d.name,
        priority,
        potentialGain: Math.round(((100 - d.score) * d.weight) / 100),
        suggestion: d.suggestion,
        current: d.currentLabel,
        target: d.idealLabel,
      };
    })
    .sort((a, b) => b.potentialGain - a.potentialGain);
  return recs;
}

const EXPLANATION_TEXT: Record<string, { up: string; down: string }> = {
  savings_ratio: { up: "Saving increased", down: "Savings decreased" },
  income_stability: {
    up: "Income became more stable",
    down: "Income stability dropped",
  },
  budget_discipline: {
    up: "Budget adherence improved",
    down: "Budget overspending increased",
  },
  expense_distribution: {
    up: "Spending diversified",
    down: "Spending concentrated",
  },
  emergency_fund: {
    up: "Emergency fund grew",
    down: "Emergency savings slipped",
  },
  cash_flow: { up: "Cash flow improved", down: "Cash flow weakened" },
  recurring_burden: {
    up: "Recurring burden reduced",
    down: "Recurring costs rose",
  },
  consistency: {
    up: "Tracking became more consistent",
    down: "Tracking less consistent",
  },
};

export function buildExplanations(
  current: ScoreDimension[],
  previous: ScoreDimension[] | null
): ScoreExplanation[] {
  if (!previous) {
    return [{ direction: "flat" as const, text: "No significant change." }];
  }
  const prevMap = new Map(previous.map((d) => [d.key, d]));
  const ups: ScoreExplanation[] = [];
  const downs: ScoreExplanation[] = [];

  for (const d of current) {
    const p = prevMap.get(d.key);
    if (!p) continue;
    const diff = d.score - p.score;
    if (diff === 0) continue;
    const text = EXPLANATION_TEXT[d.key];
    if (!text) continue;
    const entry: ScoreExplanation = {
      direction: diff > 0 ? "up" : "down",
      text: diff > 0 ? text.up : text.down,
    };
    if (diff > 0) ups.push(entry);
    else downs.push(entry);
  }

  const combined = [...ups, ...downs].slice(0, 3);
  if (combined.length === 0)
    return [{ direction: "flat", text: "No significant change." }];
  return combined;
}
