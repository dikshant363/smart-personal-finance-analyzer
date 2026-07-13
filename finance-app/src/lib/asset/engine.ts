import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export interface NetWorthSummary {
  totalAssets: number;
  totalLiabilities: number; // Stubbed for Sprint 4.1, updated in 4.2
  netWorth: number;
}

export interface AssetAllocation {
  type: string;
  totalValue: number;
  percentage: number;
}

export interface NetWorthProjectionPoint {
  month: string;
  projectedAssets: number;
  projectedLiabilities: number;
  projectedNetWorth: number;
}

export async function getNetWorthSummary(
  userId: string,
  db = prisma
): Promise<NetWorthSummary> {
  const assets = await db.asset.findMany({
    where: { userId, status: "Active" },
  });

  let totalAssets = assets.reduce(
    (sum, asset) => sum + toNumber(asset.currentValue) * (parseFloat(asset.ownership) / 100),
    0
  );

  // Dynamic integration of active investments holdings valuation
  try {
    const investmentDelegate = (db as any).investment;
    if (investmentDelegate) {
      const investments = await investmentDelegate.findMany({
        where: { userId, status: "Active" },
      });
      const totalInvestments = investments.reduce(
        (sum: number, inv: any) => sum + toNumber(inv.currentValue),
        0
      );
      totalAssets += totalInvestments;
    }
  } catch (err) {
    // Ignore if table doesn't exist
  }

  // Liabilities stub: will be updated to query the database in Sprint 4.2
  let totalLiabilities = 0;
  try {
    // Proactively check if liability model exists dynamically in case we run tests on 4.2
    const liabilityDelegate = (db as any).liability;
    if (liabilityDelegate) {
      const liabilities = await liabilityDelegate.findMany({
        where: { userId, status: "Active" },
      });
      totalLiabilities = liabilities.reduce(
        (sum: number, liab: any) => sum + toNumber(liab.outstandingBalance),
        0
      );
    }
  } catch (err) {
    // Ignore if model does not exist yet
  }

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
  };
}

export async function getAssetAllocation(
  userId: string,
  db = prisma
): Promise<AssetAllocation[]> {
  const assets = await db.asset.findMany({
    where: { userId, status: "Active" },
  });

  const totalValue = assets.reduce(
    (sum, asset) => sum + toNumber(asset.currentValue) * (parseFloat(asset.ownership) / 100),
    0
  );

  if (totalValue === 0) return [];

  const groups = new Map<string, number>();
  for (const asset of assets) {
    const val = toNumber(asset.currentValue) * (parseFloat(asset.ownership) / 100);
    groups.set(asset.type, (groups.get(asset.type) || 0) + val);
  }

  const list: AssetAllocation[] = [];
  groups.forEach((val, type) => {
    list.push({
      type,
      totalValue: val,
      percentage: Math.round((val / totalValue) * 100),
    });
  });

  return list.sort((a, b) => b.totalValue - a.totalValue);
}

export async function projectNetWorth(
  userId: string,
  months = 12,
  db = prisma
): Promise<NetWorthProjectionPoint[]> {
  const summary = await getNetWorthSummary(userId, db);
  const assets = await db.asset.findMany({
    where: { userId, status: "Active" },
  });

  // Calculate average monthly appreciation rate
  // Weighted appreciation rate
  let weightedAppreciationAnnual = 0;
  if (summary.totalAssets > 0) {
    const sumAppreciationProduct = assets.reduce((sum, a) => {
      const val = toNumber(a.currentValue) * (parseFloat(a.ownership) / 100);
      return sum + val * (toNumber(a.appreciationRate) / 100);
    }, 0);
    weightedAppreciationAnnual = sumAppreciationProduct / summary.totalAssets;
  }
  const monthlyAppreciationRate = weightedAppreciationAnnual / 12;

  // Baseline steady savings contribution (assumes +800 monthly surplus)
  const monthlySavingsSurplus = 800;

  const points: NetWorthProjectionPoint[] = [];
  let currentAssets = summary.totalAssets;
  let currentLiabilities = summary.totalLiabilities;

  for (let m = 0; m <= months; m++) {
    points.push({
      month: `Month ${m}`,
      projectedAssets: Math.round(currentAssets),
      projectedLiabilities: Math.round(currentLiabilities),
      projectedNetWorth: Math.round(currentAssets - currentLiabilities),
    });

    // Compound growth plus monthly cash savings contribution
    currentAssets = currentAssets * (1 + monthlyAppreciationRate) + monthlySavingsSurplus;
  }

  return points;
}

export interface AssetAiExplanation {
  analysis: string;
  riskRating: "Low" | "Medium" | "High";
  suggestions: string[];
}

export function getAssetAiExplanation(
  summary: NetWorthSummary,
  allocation: AssetAllocation[]
): AssetAiExplanation {
  const suggestions: string[] = [];
  let analysis = "Your net worth portfolio is currently stable with cash reserves.";
  let riskRating: "Low" | "Medium" | "High" = "Low";

  if (summary.totalAssets === 0) {
    return {
      analysis: "You have not listed any financial assets yet. Consider adding bank checking or cash reserves to start tracking your net worth.",
      riskRating: "Low",
      suggestions: ["Add your primary checking account balances."],
    };
  }

  // Look for concentration risk (> 50% in one category)
  const primaryAlloc = allocation[0];
  if (primaryAlloc && primaryAlloc.percentage > 50) {
    riskRating = "High";
    analysis = `High concentration detected: ${primaryAlloc.percentage}% of your wealth is held inside '${primaryAlloc.type}'. This increases vulnerability to sector downturns.`;
    suggestions.push(`Consider diversifying out of ${primaryAlloc.type} into alternative vehicles like low-cost mutual funds or fixed deposits.`);
  } else if (primaryAlloc && primaryAlloc.percentage > 35) {
    riskRating = "Medium";
    analysis = `Moderate concentration: ${primaryAlloc.percentage}% of assets are allocated in '${primaryAlloc.type}'. Portfolio is generally stable.`;
    suggestions.push("Monitor appreciation rates and balance exposures quarterly.");
  } else {
    analysis = "Excellent asset allocation! Your wealth is well diversified across multiple categories, lowering structural risks.";
    suggestions.push("Reinvest compounding dividends to accelerate portfolio growth.");
  }

  return {
    analysis,
    riskRating,
    suggestions,
  };
}
