import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export interface DebtOverview {
  totalDebt: number;
  monthlyEmiTotal: number;
  debtToIncomeRatio: number; // percentage
  remainingPayments: number;
  projectedPayoffMonths: number;
}

export interface RepaymentSimulationResult {
  strategy: string;
  payoffMonths: number;
  totalInterestPaid: number;
  interestSaved: number;
  timeSavedMonths: number;
}

export async function getDebtOverview(
  userId: string,
  db = prisma
): Promise<DebtOverview> {
  const debts = await db.liability.findMany({
    where: { userId, status: "Active" },
  });

  const totalDebt = debts.reduce((sum, d) => sum + toNumber(d.outstandingBalance), 0);
  const monthlyEmiTotal = debts.reduce((sum, d) => sum + toNumber(d.emiAmount), 0);

  // Calculate average monthly income dynamically from transactions
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 3, 1); // last 3 months
  const incomes = await db.transaction.aggregate({
    where: {
      userId,
      type: "Income",
      date: { gte: start },
    },
    _sum: { amount: true },
  });

  const averageMonthlyIncome = Math.max(3000, toNumber(incomes._sum.amount || 0) / 3);
  const debtToIncomeRatio = Math.round((monthlyEmiTotal / averageMonthlyIncome) * 100);

  // Estimate remaining payment counts based on average EMI and total debt
  const remainingPayments = monthlyEmiTotal > 0 ? Math.round(totalDebt / monthlyEmiTotal) : 0;

  return {
    totalDebt,
    monthlyEmiTotal,
    debtToIncomeRatio,
    remainingPayments,
    projectedPayoffMonths: remainingPayments,
  };
}

export async function calculateDebtHealthScore(
  userId: string,
  db = prisma
): Promise<number> {
  const overview = await getDebtOverview(userId, db);
  let score = 100;

  // 1. Debt to income impact
  if (overview.debtToIncomeRatio > 40) {
    score -= 30;
  } else if (overview.debtToIncomeRatio > 25) {
    score -= 15;
  }

  // 2. Size impact
  if (overview.totalDebt > 50000) {
    score -= 20;
  } else if (overview.totalDebt > 20000) {
    score -= 10;
  }

  // 3. High interest exposure
  const debts = await db.liability.findMany({
    where: { userId, status: "Active" },
  });
  const hasHighInterest = debts.some((d) => toNumber(d.interestRate) >= 15);
  if (hasHighInterest) {
    score -= 15;
  }

  return Math.min(100, Math.max(10, score));
}

export async function simulateRepaymentStrategy(
  userId: string,
  strategy: "Avalanche" | "Snowball" | "Equal",
  extraMonthlyRepayment = 200,
  db = prisma
): Promise<RepaymentSimulationResult> {
  const debts = await db.liability.findMany({
    where: { userId, status: "Active" },
  });

  if (debts.length === 0) {
    return {
      strategy,
      payoffMonths: 0,
      totalInterestPaid: 0,
      interestSaved: 0,
      timeSavedMonths: 0,
    };
  }

  // Baseline scenario projection: no extra payments
  const baselinePayoff = calculateSimulation(debts, 0, "Equal");

  // Strategy scenario projection
  const strategyPayoff = calculateSimulation(debts, extraMonthlyRepayment, strategy);

  return {
    strategy,
    payoffMonths: strategyPayoff.months,
    totalInterestPaid: Math.round(strategyPayoff.interest),
    interestSaved: Math.round(Math.max(0, baselinePayoff.interest - strategyPayoff.interest)),
    timeSavedMonths: Math.round(Math.max(0, baselinePayoff.months - strategyPayoff.months)),
  };
}

// Simple interest repayment simulation engine loop
function calculateSimulation(
  rawDebts: any[],
  extra: number,
  strategy: "Avalanche" | "Snowball" | "Equal"
): { months: number; interest: number } {
  let debts = rawDebts.map((d) => ({
    id: d.id,
    balance: toNumber(d.outstandingBalance),
    interestRate: toNumber(d.interestRate) / 1200, // monthly interest factor
    emi: toNumber(d.emiAmount),
  }));

  // Sort logic depending on repayment strategy
  if (strategy === "Avalanche") {
    // Highest interest rate first
    debts.sort((a, b) => b.interestRate - a.interestRate);
  } else if (strategy === "Snowball") {
    // Smallest outstanding balance first
    debts.sort((a, b) => a.balance - b.balance);
  }

  let totalInterest = 0;
  let monthsCount = 0;

  while (debts.some((d) => d.balance > 0) && monthsCount < 240) {
    monthsCount++;
    let currentExtra = extra;

    // Apply basic monthly EMI repayments
    for (const d of debts) {
      if (d.balance <= 0) continue;

      const monthlyInterest = d.balance * d.interestRate;
      totalInterest += monthlyInterest;

      // New balance after interest and basic payment
      const payment = Math.min(d.balance + monthlyInterest, d.emi);
      d.balance = d.balance + monthlyInterest - payment;
    }

    // Allocate extra cash flow depending on selected strategy
    for (const d of debts) {
      if (d.balance <= 0) continue;
      if (currentExtra <= 0) break;

      if (strategy === "Equal") {
        const activeCount = debts.filter((item) => item.balance > 0).length;
        const portion = currentExtra / activeCount;
        const paid = Math.min(d.balance, portion);
        d.balance -= paid;
      } else {
        // Avalanche & Snowball focus the extra amount sequentially
        const paid = Math.min(d.balance, currentExtra);
        d.balance -= paid;
        currentExtra -= paid;
      }
    }
  }

  return {
    months: monthsCount,
    interest: totalInterest,
  };
}

export interface DebtAiExplanation {
  advice: string;
  recommendations: string[];
}

export function getDebtAiExplanation(
  healthScore: number,
  totalDebt: number
): DebtAiExplanation {
  const recommendations: string[] = [];
  let advice = "Your debt status is highly manageable with minor commitments.";

  if (totalDebt === 0) {
    return {
      advice: "Congratulations, you have zero active debts! Your credit viability is excellent.",
      recommendations: ["Maintain a 0-debt budget pattern."],
    };
  }

  if (healthScore < 60) {
    advice = `Your debt health score is low (${healthScore}/100). The current leverage creates substantial monthly payment pressure.`;
    recommendations.push("Prioritize high-interest card accounts using the Avalanche strategy.");
    recommendations.push("Consider debt consolidation or loan refinancing to reduce high-interest burdens.");
  } else if (healthScore < 80) {
    advice = `Your debt leverage is moderate (${healthScore}/100). We recommend optimizing extra repayments.`;
    recommendations.push("Add an extra $100 monthly allocation to pay off smallest debts first (Snowball).");
  } else {
    advice = "Your debt load is well structured with low interest rates and consistency.";
    recommendations.push("Continue maintaining current schedules.");
  }

  return {
    advice,
    recommendations,
  };
}
