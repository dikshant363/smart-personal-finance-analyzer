export type ForecastPeriod = "7d" | "30d" | "90d" | "6m" | "1y" | "custom";
export type ForecastScenario = "expected" | "best" | "worst";
export type ForecastType =
  | "cashflow" | "savings" | "expense" | "income"
  | "budget" | "category" | "emergency_fund"
  | "health_score" | "goal" | "net_balance";

export interface ForecastInput {
  userId: string;
  period: ForecastPeriod;
  scenario: ForecastScenario;
  type: ForecastType;
  customDays?: number;
}

export interface ForecastPoint {
  date: string;
  value: number;
  lower?: number;
  upper?: number;
}

export interface ForecastResult {
  id?: string;
  period: ForecastPeriod;
  scenario: ForecastScenario;
  type: ForecastType;
  points: ForecastPoint[];
  summary: {
    startValue: number;
    endValue: number;
    change: number;
    changePercent: number;
  };
  risks: string[];
  confidence: number;
  generatedAt: string;
}

export interface SimulationInput {
  userId: string;
  adjustments: {
    incomeChange?: number;
    expenseChange?: number;
    budgetAdjustments?: Record<string, number>;
    cancelSubscriptions?: string[];
    savingsIncrease?: number;
    largePurchase?: { amount: number; date: string };
    salaryIncrease?: { percent: number; effectiveDate: string };
  };
  period: ForecastPeriod;
}

export interface SimulationResult {
  baseline: ForecastResult;
  simulated: ForecastResult;
  comparison: {
    cashflowDelta: number;
    savingsDelta: number;
    scoreDelta: number;
  };
}
