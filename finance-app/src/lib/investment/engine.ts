import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export interface InvestmentRecordInput {
  name: string;
  assetClass: string;
  ticker?: string;
  accountId?: string | null;
  portfolioId?: string | null;
  purchaseDate: string | Date;
  purchasePrice: number;
  quantity: number;
  currentValue: number;
  currency: string;
  fees?: number;
  notes?: string;
  status?: string;
}

export interface InvestmentPerformance {
  investmentId: string;
  name: string;
  assetClass: string;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  absoluteReturn: number;
  percentageReturn: number;
}

export interface PortfolioMetrics {
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  absoluteReturn: number;
  percentageReturn: number;
  diversificationScore: number;
}

export interface AllocationMetric {
  category: string;
  value: number;
  percentage: number;
}

// 1. Investment Repository Services (CRUD)
export async function createInvestment(userId: string, input: InvestmentRecordInput, db = prisma) {
  return db.investment.create({
    data: {
      userId,
      name: input.name,
      assetClass: input.assetClass,
      ticker: input.ticker || null,
      accountId: input.accountId || null,
      portfolioId: input.portfolioId || null,
      purchaseDate: new Date(input.purchaseDate),
      purchasePrice: input.purchasePrice,
      quantity: input.quantity,
      currentValue: input.currentValue,
      currency: input.currency,
      fees: input.fees ?? 0,
      notes: input.notes || null,
      status: input.status || "Active",
    },
  });
}

export async function getInvestments(userId: string, status?: string, db = prisma) {
  return db.investment.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    include: {
      portfolio: true,
      account: true,
      dividends: true,
    },
  });
}

export async function getInvestmentById(userId: string, id: string, db = prisma) {
  return db.investment.findFirst({
    where: { id, userId },
    include: { dividends: true },
  });
}

export async function updateInvestment(
  userId: string,
  id: string,
  input: Partial<InvestmentRecordInput>,
  db = prisma
) {
  const existing = await getInvestmentById(userId, id, db);
  if (!existing) return null;

  return db.investment.update({
    where: { id },
    data: {
      name: input.name ?? undefined,
      assetClass: input.assetClass ?? undefined,
      ticker: input.ticker ?? undefined,
      accountId: input.accountId ?? undefined,
      portfolioId: input.portfolioId ?? undefined,
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : undefined,
      purchasePrice: input.purchasePrice ?? undefined,
      quantity: input.quantity ?? undefined,
      currentValue: input.currentValue ?? undefined,
      currency: input.currency ?? undefined,
      fees: input.fees ?? undefined,
      notes: input.notes ?? undefined,
      status: input.status ?? undefined,
    },
  });
}

export async function deleteInvestment(userId: string, id: string, db = prisma) {
  const existing = await getInvestmentById(userId, id, db);
  if (!existing) return false;

  await db.investment.delete({ where: { id } });
  return true;
}

// 2. Dividend Services
export interface DividendInput {
  investmentId: string;
  dividendDate: string | Date;
  amount: number;
  currency: string;
  taxWithheld?: number;
  reinvestmentStatus?: string;
}

export async function recordDividend(userId: string, input: DividendInput, db = prisma) {
  // Confirm ownership of investment first
  const investment = await getInvestmentById(userId, input.investmentId, db);
  if (!investment) throw new Error("Investment not found or unauthorized");

  return db.dividend.create({
    data: {
      investmentId: input.investmentId,
      dividendDate: new Date(input.dividendDate),
      amount: input.amount,
      currency: input.currency,
      taxWithheld: input.taxWithheld ?? 0,
      reinvestmentStatus: input.reinvestmentStatus ?? "Payout",
    },
  });
}

export async function getDividends(userId: string, db = prisma) {
  return db.dividend.findMany({
    where: {
      investment: { userId },
    },
    include: {
      investment: true,
    },
  });
}

// 3. Watchlist Services
export interface WatchlistInput {
  name: string;
  ticker?: string;
  targetPrice?: number;
  priority?: string;
  notes?: string;
  status?: string;
}

export async function createWatchlistItem(userId: string, input: WatchlistInput, db = prisma) {
  return db.watchlistItem.create({
    data: {
      userId,
      name: input.name,
      ticker: input.ticker || null,
      targetPrice: input.targetPrice || null,
      priority: input.priority || "Medium",
      notes: input.notes || null,
      status: input.status || "Active",
    },
  });
}

export async function getWatchlistItems(userId: string, db = prisma) {
  return db.watchlistItem.findMany({
    where: { userId },
  });
}

export async function deleteWatchlistItem(userId: string, id: string, db = prisma) {
  const item = await db.watchlistItem.findFirst({ where: { id, userId } });
  if (!item) return false;
  await db.watchlistItem.delete({ where: { id } });
  return true;
}

// 4. Performance & Allocation Engines
export function calculateInvestmentPerformance(inv: any): InvestmentPerformance {
  const totalInvested = toNumber(inv.purchasePrice) * toNumber(inv.quantity) + toNumber(inv.fees);
  const currentValue = toNumber(inv.currentValue);
  const profitLoss = currentValue - totalInvested;
  const absoluteReturn = profitLoss;
  const percentageReturn = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  return {
    investmentId: inv.id,
    name: inv.name,
    assetClass: inv.assetClass,
    totalInvested,
    currentValue,
    profitLoss,
    absoluteReturn,
    percentageReturn,
  };
}

export function calculatePortfolioMetrics(investments: any[]): PortfolioMetrics {
  let totalInvested = 0;
  let currentValue = 0;

  for (const inv of investments) {
    const perf = calculateInvestmentPerformance(inv);
    totalInvested += perf.totalInvested;
    currentValue += perf.currentValue;
  }

  const profitLoss = currentValue - totalInvested;
  const absoluteReturn = profitLoss;
  const percentageReturn = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  // Diversification Score (HHI Index: 1 - sum(w_i^2))
  let diversificationScore = 1.0;
  if (currentValue > 0) {
    const weights: { [assetClass: string]: number } = {};
    for (const inv of investments) {
      weights[inv.assetClass] = (weights[inv.assetClass] || 0) + toNumber(inv.currentValue);
    }

    let hhiSum = 0;
    Object.values(weights).forEach((val) => {
      const weight = val / currentValue;
      hhiSum += weight * weight;
    });

    diversificationScore = 1 - hhiSum;
  }

  return {
    totalInvested,
    currentValue,
    profitLoss,
    absoluteReturn,
    percentageReturn,
    diversificationScore: Math.round(diversificationScore * 100) / 100,
  };
}

export function calculateAssetAllocation(investments: any[]): AllocationMetric[] {
  let totalVal = 0;
  const groups: { [assetClass: string]: number } = {};

  for (const inv of investments) {
    const val = toNumber(inv.currentValue);
    totalVal += val;
    groups[inv.assetClass] = (groups[inv.assetClass] || 0) + val;
  }

  if (totalVal === 0) return [];

  return Object.entries(groups)
    .map(([category, value]) => ({
      category,
      value,
      percentage: Math.round((value / totalVal) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

export function calculatePortfolioAllocation(investments: any[]): AllocationMetric[] {
  let totalVal = 0;
  const groups: { [portfolioName: string]: number } = {};

  for (const inv of investments) {
    const val = toNumber(inv.currentValue);
    totalVal += val;
    const name = inv.portfolio?.name || "Unassigned";
    groups[name] = (groups[name] || 0) + val;
  }

  if (totalVal === 0) return [];

  return Object.entries(groups)
    .map(([category, value]) => ({
      category,
      value,
      percentage: Math.round((value / totalVal) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

export function calculateCurrencyAllocation(investments: any[]): AllocationMetric[] {
  let totalVal = 0;
  const groups: { [currency: string]: number } = {};

  for (const inv of investments) {
    const val = toNumber(inv.currentValue);
    totalVal += val;
    groups[inv.currency] = (groups[inv.currency] || 0) + val;
  }

  if (totalVal === 0) return [];

  return Object.entries(groups)
    .map(([category, value]) => ({
      category,
      value,
      percentage: Math.round((value / totalVal) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

// AI Analysis Explanations ground guidelines: Grounded, no advice, transparent
export function generateAIInvestmentExplanation(
  metrics: PortfolioMetrics,
  assetAllocations: AllocationMetric[]
): string {
  const bulletAllocations = assetAllocations
    .map((a) => `- **${a.category}**: ${a.percentage}% ($${a.value.toFixed(2)})`)
    .join("\n");

  const riskMessage =
    metrics.diversificationScore < 0.3
      ? "Observation: The portfolio displays higher concentration risks (low diversification score). Broadening asset class allocation could distribute specific sector vulnerability."
      : "Observation: The portfolio is moderately diversified across multiple financial domains.";

  return `### Portfolio Composition Summary
Current total valuation is **$${metrics.currentValue.toFixed(2)}** against a total invested sum of **$${metrics.totalInvested.toFixed(2)}**, showing an absolute net return of **$${metrics.absoluteReturn.toFixed(2)}** (${metrics.percentageReturn.toFixed(2)}%).

#### Asset Distribution
${bulletAllocations}

#### Risk & Diversification
- **Diversification Score (HHI)**: ${metrics.diversificationScore} / 1.00
- ${riskMessage}

*Notice: This diagnostic dashboard represents historical records and deterministic valuation metrics. It is intended solely for general education. It does not recommend purchasing or selling specific securities, nor does it guarantee future yields.*`;
}
