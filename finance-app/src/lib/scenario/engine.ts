import { prisma } from "@/lib/prisma";
import { calculateHealthScore } from "@/lib/score/engine";
import { toNumber } from "@/lib/currency";

export interface ScenarioSimulationResult {
  scenarioId: string;
  name: string;
  type: string;
  durationMonths: number;
  cashFlowImpactMonthly: number;
  savingsImpactMonthly: number;
  simulatedSavingsTotal: number;
  simulatedHealthScore: number;
  simulatedEmergencyFundScore: number;
  completionProbability: number; // 0 to 100
  risks: string[];
  goalDelays: string[];
}

export interface ScenarioInput {
  id: string;
  name: string;
  type: string;
  estimatedCost: number;
  expectedIncomeImpact: number;
  expectedExpenseImpact: number;
  durationMonths: number;
  startDate: Date;
}

export async function simulateScenario(
  userId: string,
  input: ScenarioInput,
  db = prisma
): Promise<ScenarioSimulationResult> {
  // 1. Gather baseline settings
  const baseSurplus = 800; // default baseline monthly surplus (income - expense)
  const baseSavings = 5000; // baseline savings reserve

  // 2. Deterministic calculations
  // Cash flow monthly impact = expectedIncomeImpact - expectedExpenseImpact
  const cashFlowImpactMonthly = input.expectedIncomeImpact - input.expectedExpenseImpact;

  // Savings impact monthly = baseSurplus + cashFlowImpactMonthly
  const savingsImpactMonthly = baseSurplus + cashFlowImpactMonthly;

  // Simulated total savings after scenario duration (minus upfront estimatedCost if any)
  const simulatedSavingsTotal =
    baseSavings + savingsImpactMonthly * input.durationMonths - input.estimatedCost;

  // 3. Simulated Emergency Resilience
  let simulatedEmergencyFundScore = 80;
  const risks: string[] = [];
  if (simulatedSavingsTotal < 3000) {
    simulatedEmergencyFundScore = 40;
    risks.push("Emergency reserve drops below safe threshold of 3,000.");
  } else if (simulatedSavingsTotal < 1500) {
    simulatedEmergencyFundScore = 20;
    risks.push("Critical risk: Scenario results in near-complete depletion of liquid assets.");
  }

  // 4. Simulated Health Score
  let simulatedHealthScore = 75;
  if (savingsImpactMonthly < 100) {
    simulatedHealthScore -= 20;
    risks.push("Monthly savings rate drops significantly, impacting budget flexibility.");
  } else if (savingsImpactMonthly >= baseSurplus * 1.2) {
    simulatedHealthScore += 10;
  }
  if (simulatedSavingsTotal < 0) {
    simulatedHealthScore = Math.max(10, simulatedHealthScore - 40);
    risks.push("Scenario creates a net deficit balance. High risk of debt accumulation.");
  }
  simulatedHealthScore = Math.min(100, Math.max(10, simulatedHealthScore));

  // 5. Completion probability
  let completionProbability = 95;
  if (savingsImpactMonthly < 0) {
    completionProbability = 30;
    risks.push("Negative monthly cash flow makes this scenario highly unsustainable.");
  } else if (simulatedSavingsTotal < 0) {
    completionProbability = 50;
  } else if (input.estimatedCost > baseSavings * 1.5) {
    completionProbability = 65;
    risks.push("Upfront cost exceeds your current liquid savings assets.");
  }

  // 6. Goal conflicts & delays
  const goalDelays: string[] = [];
  const goals = await db.goal.findMany({ where: { userId } });
  for (const g of goals) {
    const target = toNumber(g.targetAmount);
    const current = toNumber(g.currentAmount);
    const deficit = target - current;

    if (deficit > 0 && savingsImpactMonthly < baseSurplus) {
      goalDelays.push(`Goal '${g.name}' target completion date may delay due to lower monthly margins.`);
    }
  }

  return {
    scenarioId: input.id,
    name: input.name,
    type: input.type,
    durationMonths: input.durationMonths,
    cashFlowImpactMonthly,
    savingsImpactMonthly,
    simulatedSavingsTotal,
    simulatedHealthScore,
    simulatedEmergencyFundScore,
    completionProbability,
    risks,
    goalDelays,
  };
}

export async function compareScenarios(
  userId: string,
  scenarioInputs: ScenarioInput[],
  db = prisma
): Promise<ScenarioSimulationResult[]> {
  return Promise.all(
    scenarioInputs.map((input) => simulateScenario(userId, input, db))
  );
}

export interface ScenarioAiExplanation {
  advantages: string[];
  disadvantages: string[];
  tradeoffs: string;
  preparationAdvice: string;
  alternativeStrategy: string;
}

export function getScenarioAiExplanation(
  simResult: ScenarioSimulationResult
): ScenarioAiExplanation {
  const advantages: string[] = [];
  const disadvantages: string[] = [];
  let tradeoffs = "";
  let preparationAdvice = "";
  let alternativeStrategy = "";

  if (simResult.type === "BuyHouse") {
    advantages.push("Builds long-term home equity asset.");
    advantages.push("Stable living cost instead of rental inflation.");
    disadvantages.push("High upfront down payment depletes initial liquid margins.");
    disadvantages.push("Restricts relocation mobility and career flexibility.");
    tradeoffs = "Trading immediate liquid cash flexibility for a long-term leveraged illiquid asset.";
    preparationAdvice = "Establish an independent home maintenance emergency fund (~1% value annually) before closing.";
    alternativeStrategy = "Continue renting for 12 months to accumulate larger cash reserves and avoid down payment stress.";
  } else if (simResult.type === "Retirement") {
    advantages.push("Guarantees future financial independence.");
    advantages.push("Compounding growth shields wealth against future cost changes.");
    disadvantages.push("Locks money away in long-term retirement accounts with withdrawal locks.");
    tradeoffs = "Trading current consumption luxury for future lifestyle security.";
    preparationAdvice = "Automate paycheck contributions to maximize tax-sheltered employer matching packages.";
    alternativeStrategy = "Start with a 6% contribution rate, increasing it by 1% each salary review cycle.";
  } else {
    advantages.push("Aligns with long-term lifestyle goals.");
    disadvantages.push("Reduces near-term discretionary savings rates.");
    tradeoffs = "Balances immediate cash reserves with milestones.";
    preparationAdvice = "Review current subscriptions to cut overhead before triggering this plan.";
    alternativeStrategy = "Delay launch by 3 months to build additional cushion buffer reserves.";
  }

  return {
    advantages,
    disadvantages,
    tradeoffs,
    preparationAdvice,
    alternativeStrategy,
  };
}
