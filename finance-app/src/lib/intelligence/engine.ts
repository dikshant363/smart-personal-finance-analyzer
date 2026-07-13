export interface LearningPath {
  id: string;
  title: string;
  description: string;
  steps: string[];
}

export interface DecisionScenario {
  rentMonthly: number;
  buyPrice: number;
  downPayment: number;
  years: number;
}

export interface DecisionResult {
  totalRentCost: number;
  totalBuyCost: number;
  advice: string;
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "budgeting_basics",
    title: "Budgeting Fundamentals",
    description: "Learn how to allocation income effectively using the 50/30/20 standard.",
    steps: ["Understand income vs spend", "Categorize needs vs wants", "Set saving buffer goals"],
  },
  {
    id: "debt_reduction",
    title: "Debt Avalanche & Snowball Strategy",
    description: "Compare high-interest paying prioritizations vs fast victory motivators.",
    steps: ["List all liabilities", "Select repayment rule path", "Calculate payoff schedule target"],
  },
];

export function computeRentVsBuy(scenario: DecisionScenario): DecisionResult {
  const annualRentGrowth = 1.03;
  let totalRentCost = 0;
  let currentRent = scenario.rentMonthly;

  for (let i = 0; i < scenario.years; i++) {
    totalRentCost += currentRent * 12;
    currentRent *= annualRentGrowth;
  }

  // Basic buying cost scenario: Price + 1% annual maintenance minus down payment equity
  const annualMaintenance = scenario.buyPrice * 0.01 * scenario.years;
  const interestCostRate = 0.06;
  const loanAmount = scenario.buyPrice - scenario.downPayment;
  const estimatedInterest = loanAmount * interestCostRate * scenario.years;
  const totalBuyCost = scenario.downPayment + annualMaintenance + estimatedInterest;

  let advice = "Renting is financially optimal for this timeframe.";
  if (totalBuyCost < totalRentCost) {
    advice = "Buying yields lower net cost over this projection period.";
  }

  return {
    totalRentCost: Math.round(totalRentCost),
    totalBuyCost: Math.round(totalBuyCost),
    advice,
  };
}
