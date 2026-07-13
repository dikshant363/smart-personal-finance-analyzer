import { prisma } from "@/lib/prisma";

export interface RetirementInput {
  name: string;
  profileType: string; // "Early" | "Traditional" | "Semi" | "Custom"
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedExpenses: number;
  expectedReturn: number; // e.g. 0.07 (7%)
  expectedInflation: number; // e.g. 0.025 (2.5%)
  withdrawalStrategy: string; // "Safe Withdrawal (4%)" | "Fixed Amount"
  currency: string;
  workspaceId?: string | null;
}

export interface ProjectionPoint {
  age: number;
  year: number;
  savings: number;
  contribution: number;
  expenses: number;
}

export interface RetirementMetrics {
  yearsUntilRetirement: number;
  projectedNestEgg: number;
  totalContributions: number;
  annualExpensesAtRetirement: number;
  withdrawalDurationYears: number;
  fundingGap: number;
  isFundingSufficient: boolean;
}

// 1. Calculations & Projections Engine
export function calculateRetirementProjections(
  input: RetirementInput
): { trajectory: ProjectionPoint[]; metrics: RetirementMetrics } {
  const yearsToRetire = Math.max(0, input.retirementAge - input.currentAge);
  const yearsInRetirement = Math.max(0, input.lifeExpectancy - input.retirementAge);

  let savings = input.currentSavings;
  let totalContributions = 0;
  const trajectory: ProjectionPoint[] = [];

  const annualReturn = input.expectedReturn;
  const annualInflation = input.expectedInflation;
  const monthlyReturn = Math.pow(1 + annualReturn, 1 / 12) - 1;

  let currentYear = new Date().getFullYear();

  // Accumulation Phase
  for (let year = 1; year <= yearsToRetire; year++) {
    const age = input.currentAge + year;
    // Simulate monthly contributions and compounding
    let yearContributions = 0;
    for (let m = 0; m < 12; m++) {
      savings = (savings + input.monthlyContribution) * (1 + monthlyReturn);
      yearContributions += input.monthlyContribution;
    }
    totalContributions += yearContributions;

    trajectory.push({
      age,
      year: currentYear + year,
      savings: Math.round(savings),
      contribution: Math.round(totalContributions),
      expenses: 0,
    });
  }

  const projectedNestEgg = savings;

  // Inflation-adjusted expenses at the start of retirement
  const annualExpensesAtRetirement =
    input.expectedExpenses * 12 * Math.pow(1 + annualInflation, yearsToRetire);

  // Target Nest Egg calculation (based on safe withdrawal rate 4% or target multiplier of 25x expenses)
  const targetNestEgg = annualExpensesAtRetirement * 25; // standard 4% SWR rule
  const fundingGap = Math.max(0, targetNestEgg - projectedNestEgg);

  // Decumulation Phase (Withdrawal Simulator)
  let retirementSavings = projectedNestEgg;
  let runOutAge = input.lifeExpectancy;
  let runsOut = false;
  let withdrawalDuration = yearsInRetirement;

  const trajectoryRetirement: ProjectionPoint[] = [];
  let adjustedExpenses = annualExpensesAtRetirement;

  for (let year = 1; year <= yearsInRetirement; year++) {
    const age = input.retirementAge + year;
    // Compounding on remaining retirement savings
    retirementSavings = retirementSavings * (1 + annualReturn);

    // Annual withdrawal at the start/end of year
    retirementSavings -= adjustedExpenses;

    // Adjust expenses for inflation for the next year
    adjustedExpenses = adjustedExpenses * (1 + annualInflation);

    if (retirementSavings < 0) {
      retirementSavings = 0;
      if (!runsOut) {
        runOutAge = age;
        runsOut = true;
        withdrawalDuration = year - 1;
      }
    }

    trajectoryRetirement.push({
      age,
      year: currentYear + yearsToRetire + year,
      savings: Math.round(retirementSavings),
      contribution: Math.round(totalContributions),
      expenses: Math.round(adjustedExpenses),
    });
  }

  return {
    trajectory: [...trajectory, ...trajectoryRetirement],
    metrics: {
      yearsUntilRetirement: yearsToRetire,
      projectedNestEgg: Math.round(projectedNestEgg),
      totalContributions: Math.round(totalContributions),
      annualExpensesAtRetirement: Math.round(annualExpensesAtRetirement),
      withdrawalDurationYears: withdrawalDuration,
      fundingGap: Math.round(fundingGap),
      isFundingSufficient: projectedNestEgg >= targetNestEgg,
    },
  };
}

// 2. CRUD Persistence
export async function createRetirementPlan(userId: string, input: RetirementInput, db = prisma) {
  return db.retirementPlan.create({
    data: {
      userId,
      name: input.name,
      profileType: input.profileType,
      currentAge: input.currentAge,
      retirementAge: input.retirementAge,
      lifeExpectancy: input.lifeExpectancy,
      currentSavings: input.currentSavings,
      monthlyContribution: input.monthlyContribution,
      expectedExpenses: input.expectedExpenses,
      expectedReturn: input.expectedReturn,
      expectedInflation: input.expectedInflation,
      withdrawalStrategy: input.withdrawalStrategy,
      currency: input.currency,
      workspaceId: input.workspaceId || null,
    },
  });
}

export async function getRetirementPlans(userId: string, db = prisma) {
  return db.retirementPlan.findMany({
    where: { userId },
  });
}

export async function getRetirementPlanById(userId: string, id: string, db = prisma) {
  return db.retirementPlan.findFirst({
    where: { id, userId },
  });
}

export async function updateRetirementPlan(
  userId: string,
  id: string,
  input: Partial<RetirementInput>,
  db = prisma
) {
  return db.retirementPlan.update({
    where: { id },
    data: {
      name: input.name ?? undefined,
      profileType: input.profileType ?? undefined,
      currentAge: input.currentAge ?? undefined,
      retirementAge: input.retirementAge ?? undefined,
      lifeExpectancy: input.lifeExpectancy ?? undefined,
      currentSavings: input.currentSavings ?? undefined,
      monthlyContribution: input.monthlyContribution ?? undefined,
      expectedExpenses: input.expectedExpenses ?? undefined,
      expectedReturn: input.expectedReturn ?? undefined,
      expectedInflation: input.expectedInflation ?? undefined,
      withdrawalStrategy: input.withdrawalStrategy ?? undefined,
      currency: input.currency ?? undefined,
    },
  });
}

export async function deleteRetirementPlan(userId: string, id: string, db = prisma) {
  await db.retirementPlan.delete({ where: { id } });
  return true;
}

// 3. AI Explanation Grounding (strictly non-regulated educational explanation)
export function generateAIRetirementExplanation(metrics: RetirementMetrics, input: RetirementInput): string {
  const SWR = 0.04;
  const statusDescription = metrics.isFundingSufficient
    ? "Observation: Based on a standard 4% safe withdrawal rate metric, your projected savings at retirement exceed the recommended nest egg target of 25x expected expenses. This indicates adequate funding under the simulated parameters."
    : `Observation: There is a projected nest egg gap of $${metrics.fundingGap.toLocaleString()}. Consider either increasing monthly contributions, delaying retirement age, or lowering post-retirement spending to align with the SWR nest egg target.`;

  return `### Long-Term Retirement Projection Summary
For the retirement plan **"${input.name}"** (${input.profileType} profile):

- **Accumulation Phase**: You have **${metrics.yearsUntilRetirement} years** until retirement at age **${input.retirementAge}**.
- **Nest Egg Target**: To support annual expenses of **$${metrics.annualExpensesAtRetirement.toLocaleString()}** (adjusted for expected inflation of ${(input.expectedInflation * 100).toFixed(1)}%), the target is **$${(metrics.annualExpensesAtRetirement / SWR).toLocaleString()}** (25x SWR).
- **Projected Nest Egg**: **$${metrics.projectedNestEgg.toLocaleString()}** (based on compounding at ${(input.expectedReturn * 100).toFixed(1)}% return).
- **Withdrawal Lifespan**: Projected savings are simulated to sustain withdrawals for **${metrics.withdrawalDurationYears} years**.

${statusDescription}

*Notice: This simulation relies entirely on user-defined investment return and inflation assumptions. It is for educational purposes only. It is not regulated investment or tax advice and does not guarantee financial outcomes.*`;
}
