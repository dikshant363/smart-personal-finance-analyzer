export interface ExplanationTrace {
  title: string;
  summary: string;
  evidence: string[];
  calculationSources: string[];
  dataSources: string[];
  assumptions: string[];
  confidence: "High" | "Moderate" | "Low";
  confidenceReason: string;
  limitations: string[];
  timestamp: Date;
}

export function buildExplanation(
  targetType: "Score" | "RiskAlert" | "Forecast" | "DigitalTwin",
  payload: any
): ExplanationTrace {
  const timestamp = new Date();

  switch (targetType) {
    case "Score":
      return {
        title: "Financial Health Score Explanation",
        summary: `Health score calculated at ${payload.score || 72} based on asset-to-debt margins, emergency savings ratios, and budget limits.`,
        evidence: [
          `Cash-to-expense coverage: ${payload.monthsCovered || 4} months`,
          `Active budgets adhering to limit margins`,
        ],
        calculationSources: ["HealthScoreEngine", "DimensionsCalculator"],
        dataSources: ["Account Ledger", "Budget Allocation Register"],
        assumptions: [
          "Monthly expenses remain stable around average parameters",
          "Assets values are updated via live connectors",
        ],
        confidence: payload.monthsCovered > 3 ? "High" : "Moderate",
        confidenceReason: "Derived directly from historical ledger records and active budget accounts.",
        limitations: ["Does not incorporate future stock market volatility or sudden cash drains"],
        timestamp,
      };

    case "RiskAlert":
      return {
        title: `Predictive Risk: ${payload.alertName || "General Risk Warning"}`,
        summary: "Risk flags triggered based on deterministic criteria evaluated by the early warning service.",
        evidence: [
          payload.evidence || "Asset value thresholds exceeded",
        ],
        calculationSources: ["PredictiveRiskEngine", "RuleService"],
        dataSources: ["Investments Portfolio", "Goal Milestone Progress Tracker"],
        assumptions: [
          "Recent transaction frequencies continue over the next quarter",
        ],
        confidence: "High",
        confidenceReason: "Triggered on exact threshold limits (e.g. cash reserves < 3 months).",
        limitations: ["Excludes potential outside capital injections or asset liquidations"],
        timestamp,
      };

    case "Forecast":
    default:
      return {
        title: "Simulation Projection Explanation",
        summary: "Long-term cash flow and net worth curves projected over configurable years.",
        evidence: [
          `Simulated return: ${(payload.expectedReturn * 100).toFixed(1)}%`,
          `Projected years: ${payload.years || 10} years`,
        ],
        calculationSources: ["MonteCarloEngine", "ScenarioSimulator"],
        dataSources: ["TwinBaselineSnapshot"],
        assumptions: [
          `Annual return remains fixed at ${(payload.expectedReturn * 100).toFixed(1)}% without variance`,
          `Inflation drag stays at ${(payload.inflationRate * 100).toFixed(1)}%`,
        ],
        confidence: "Low",
        confidenceReason: "Stochastic variables become increasingly variable over long ranges.",
        limitations: ["Historical averages do not predict future market runs"],
        timestamp,
      };
  }
}
