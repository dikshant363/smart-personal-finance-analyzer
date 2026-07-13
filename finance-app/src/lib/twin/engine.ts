import { prisma } from "@/lib/prisma";

export interface TwinBaseline {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentNetWorth: number;
  investmentBalance: number;
  debtBalance: number;
}

export interface ScenarioAssumptions {
  inflationRate: number;      // e.g. 0.03 (3%)
  investmentReturn: number;   // e.g. 0.08 (8%)
  salaryGrowth: number;       // e.g. 0.04 (4%)
}

export interface ScenarioImpact {
  years: number[];
  projectedNetWorthBaseline: number[];
  projectedNetWorthScenario: number[];
  cashFlowBaseline: number[];
  cashFlowScenario: number[];
}

export async function buildFinancialBaseline(userId: string, db = prisma): Promise<TwinBaseline> {
  const [accounts, investments, liabilities] = await Promise.all([
    db.account.findMany({ where: { userId } }),
    db.investment.findMany({ where: { userId } }),
    db.liability?.findMany ? db.liability.findMany({ where: { userId } }) : Promise.resolve([]),
  ]);

  const accountSum = accounts.reduce((acc, a) => acc + Number(a.currentBalance), 0);
  const investmentSum = investments.reduce((acc, i) => acc + Number(i.currentValue), 0);
  const debtSum = liabilities ? liabilities.reduce((acc, l: any) => acc + Number(l.currentBalance || 0), 0) : 0;

  // Let's query transactions in the last 30 days to approximate income and expenses
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const transactions = await db.transaction.findMany({
    where: { userId, date: { gte: thirtyDaysAgo } },
  });

  let income = 0;
  let expenses = 0;
  for (const t of transactions) {
    const amt = Number(t.amount);
    if (t.type === "Income") {
      income += amt;
    } else if (t.type === "Expense") {
      expenses += amt;
    }
  }

  // fallback mock values if transaction register is clean/new
  return {
    monthlyIncome: income || 6000,
    monthlyExpenses: expenses || 4000,
    currentNetWorth: (accountSum + investmentSum) - debtSum || 80000,
    investmentBalance: investmentSum || 30000,
    debtBalance: debtSum || 10000,
  };
}

export function simulateScenario(
  baseline: TwinBaseline,
  changes: {
    monthlySavingsDelta?: number;
    discretionarySpendDelta?: number;
    salaryIncreasePercent?: number;
    extraDebtPayment?: number;
  },
  assumptions: ScenarioAssumptions,
  projectionYears = 10
): ScenarioImpact {
  const years: number[] = [];
  const projectedNetWorthBaseline: number[] = [];
  const projectedNetWorthScenario: number[] = [];
  const cashFlowBaseline: number[] = [];
  const cashFlowScenario: number[] = [];

  let nwBase = baseline.currentNetWorth;
  let nwScen = baseline.currentNetWorth;

  let baseInv = baseline.investmentBalance;
  let scenInv = baseline.investmentBalance;

  let baseDebt = baseline.debtBalance;
  let scenDebt = baseline.debtBalance;

  const startingSalary = baseline.monthlyIncome * 12;
  const startingExpenses = baseline.monthlyExpenses * 12;

  for (let year = 1; year <= projectionYears; year++) {
    years.push(year);

    // Baseline projections
    const salaryBase = startingSalary * Math.pow(1 + assumptions.salaryGrowth, year - 1);
    const expenseBase = startingExpenses * Math.pow(1 + assumptions.inflationRate, year - 1);
    const baseSavings = Math.max(0, salaryBase - expenseBase);
    
    // Scenarios projections
    const salaryScen = (startingSalary * (1 + (changes.salaryIncreasePercent || 0) / 100)) * Math.pow(1 + assumptions.salaryGrowth, year - 1);
    const expenseScen = (startingExpenses + (changes.discretionarySpendDelta || 0) * 12) * Math.pow(1 + assumptions.inflationRate, year - 1);
    
    // adjust savings based on delta change
    const scenSavings = Math.max(0, (salaryScen - expenseScen) + (changes.monthlySavingsDelta || 0) * 12);

    // Apply returns
    baseInv = baseInv * (1 + assumptions.investmentReturn) + baseSavings;
    scenInv = scenInv * (1 + assumptions.investmentReturn) + scenSavings;

    // Apply extra debt payment
    if (changes.extraDebtPayment && year === 1) {
      scenDebt = Math.max(0, scenDebt - changes.extraDebtPayment);
    }

    nwBase = baseInv - baseDebt;
    nwScen = scenInv - scenDebt;

    projectedNetWorthBaseline.push(Math.round(nwBase));
    projectedNetWorthScenario.push(Math.round(nwScen));
    cashFlowBaseline.push(Math.round(baseSavings));
    cashFlowScenario.push(Math.round(scenSavings));
  }

  return {
    years,
    projectedNetWorthBaseline,
    projectedNetWorthScenario,
    cashFlowBaseline,
    cashFlowScenario,
  };
}
