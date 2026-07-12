import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";
import { getEmergencyFundSettings } from "./repository";

export type Db = typeof prisma;

export interface EmergencyMetrics {
  monthlyEssentialExpenses: number;
  emergencyFundTarget: number;
  currentEmergencyFund: number;
  coverageDurationMonths: number;
  savingsRate: number;
  monthlyContribution: number;
  completionForecastMonths: number | null;
  completionForecastDate: Date | null;
  readinessScore: number;
  readinessCategory: "Excellent" | "Good" | "Moderate" | "Low" | "Critical";
}

export async function calculateEmergencyMetrics(
  userId: string,
  db: Db = prisma
): Promise<EmergencyMetrics> {
  const settings = await getEmergencyFundSettings(userId, db);

  // 1. Calculate historical average monthly expenses and income over last 6 months
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const transactions = await db.transaction.groupBy({
    by: ["type"],
    where: {
      userId,
      date: { gte: start, lte: now },
    },
    _sum: { amount: true },
  });

  const totalIncome = toNumber(transactions.find((t) => t.type === "Income")?._sum.amount);
  const totalExpense = toNumber(transactions.find((t) => t.type === "Expense")?._sum.amount);

  const averageMonthlyExpenses = totalExpense / 6;
  const averageMonthlyIncome = totalIncome / 6;
  const savingsRate = Math.max(0, averageMonthlyIncome - averageMonthlyExpenses);

  // Determine monthly essential expenses (default to 70% of total expenses if not overridden)
  const monthlyEssentialExpenses = settings.customEssentialExpenses ?? (averageMonthlyExpenses * 0.7);

  // 2. Determine current emergency fund reserve
  // Start with any active goal of type "emergency_fund"
  const emergencyGoals = await db.goal.findMany({
    where: {
      userId,
      type: "emergency_fund",
      status: { in: ["active", "ahead_of_schedule", "behind_schedule"] },
    },
    select: {
      currentAmount: true,
      actualMonthlyContribution: true,
      estimatedMonthlyContribution: true,
    },
  });

  const goalsReserve = emergencyGoals.reduce((sum, g) => sum + toNumber(g.currentAmount), 0);
  const goalContribution = emergencyGoals.reduce(
    (sum, g) => sum + toNumber(g.actualMonthlyContribution || g.estimatedMonthlyContribution),
    0
  );

  // Fallback to settings.customReserve, or dynamically compute net savings if none
  let currentEmergencyFund = 0;
  if (settings.customReserve !== null) {
    currentEmergencyFund = settings.customReserve;
  } else {
    currentEmergencyFund = goalsReserve > 0 ? goalsReserve : Math.max(0, totalIncome - totalExpense);
  }

  // Target Fund
  const emergencyFundTarget = monthlyEssentialExpenses * settings.targetMonths;

  // Coverage Duration
  const coverageDurationMonths = monthlyEssentialExpenses > 0 ? currentEmergencyFund / monthlyEssentialExpenses : 0;

  // Monthly Contribution
  const monthlyContribution = goalContribution > 0 ? goalContribution : savingsRate * 0.3; // Default 30% of savings

  // Completion Forecast
  const remainingTarget = Math.max(0, emergencyFundTarget - currentEmergencyFund);
  let completionForecastMonths: number | null = null;
  let completionForecastDate: Date | null = null;

  if (remainingTarget > 0 && monthlyContribution > 0) {
    completionForecastMonths = remainingTarget / monthlyContribution;
    const daysNeeded = Math.ceil(completionForecastMonths * 30.436);
    const compDate = new Date();
    compDate.setDate(compDate.getDate() + daysNeeded);
    completionForecastDate = compDate;
  } else if (remainingTarget === 0) {
    completionForecastMonths = 0;
    completionForecastDate = now;
  }

  // 3. Emergency Readiness Score (0-100)
  // Coverage Ratio: up to 70 points
  const coverageRatio = emergencyFundTarget > 0 ? currentEmergencyFund / emergencyFundTarget : 0;
  const coverageScore = Math.min(70, coverageRatio * 70);

  // Savings Buffer: up to 20 points
  const savingsBufferScore = savingsRate > monthlyEssentialExpenses * 0.2 ? 20 : savingsRate > 0 ? 10 : 0;

  // Liquidity Buffer: up to 10 points
  const liquidityScore = currentEmergencyFund >= monthlyEssentialExpenses ? 10 : 0;

  const readinessScore = Math.round(coverageScore + savingsBufferScore + liquidityScore);

  let readinessCategory: "Excellent" | "Good" | "Moderate" | "Low" | "Critical" = "Critical";
  if (readinessScore >= 90) readinessCategory = "Excellent";
  else if (readinessScore >= 70) readinessCategory = "Good";
  else if (readinessScore >= 50) readinessCategory = "Moderate";
  else if (readinessScore >= 30) readinessCategory = "Low";

  return {
    monthlyEssentialExpenses: Math.round(monthlyEssentialExpenses * 100) / 100,
    emergencyFundTarget: Math.round(emergencyFundTarget * 100) / 100,
    currentEmergencyFund: Math.round(currentEmergencyFund * 100) / 100,
    coverageDurationMonths: Math.round(coverageDurationMonths * 100) / 100,
    savingsRate: Math.round(savingsRate * 100) / 100,
    monthlyContribution: Math.round(monthlyContribution * 100) / 100,
    completionForecastMonths: completionForecastMonths !== null ? Math.round(completionForecastMonths * 10) / 10 : null,
    completionForecastDate,
    readinessScore,
    readinessCategory,
  };
}
