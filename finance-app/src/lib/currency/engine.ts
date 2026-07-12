import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export interface CurrencyAllocation {
  currency: string;
  totalValueBase: number;
  percentage: number;
}

// In-memory conversion rates cache
const ratesCache = new Map<string, number>();

export function clearRatesCache() {
  ratesCache.clear();
}

// In-memory fallback rates
const FALLBACK_RATES: Record<string, number> = {
  "USD_USD": 1.0,
  "EUR_USD": 1.08,
  "GBP_USD": 1.27,
  "INR_USD": 0.012,
  "USD_EUR": 1 / 1.08,
  "USD_GBP": 1 / 1.27,
  "USD_INR": 1 / 0.012,
};

export async function convertAmount(
  amount: number,
  from: string,
  to: string,
  date = new Date(),
  db = prisma
): Promise<number> {
  if (from === to) return amount;

  const cacheKey = `${from}_${to}_${date.toDateString()}`;
  if (ratesCache.has(cacheKey)) {
    return amount * (ratesCache.get(cacheKey) || 1);
  }

  // Look up in database
  let rate = 0;
  try {
    const record = await db.exchangeRate.findFirst({
      where: {
        fromCurrency: from,
        toCurrency: to,
        date: { lte: date },
      },
      orderBy: { date: "desc" },
    });

    if (record) {
      rate = toNumber(record.rate);
    }
  } catch (err) {
    console.error("Exchange rate query error:", err);
  }

  // Fallback check
  if (rate === 0) {
    const key = `${from}_${to}`;
    rate = FALLBACK_RATES[key] || 0;

    if (rate === 0) {
      // Try to convert via USD bridge
      const fromToUsdKey = `${from}_USD`;
      const usdToToKey = `USD_${to}`;
      const r1 = FALLBACK_RATES[fromToUsdKey] || 1;
      const r2 = FALLBACK_RATES[usdToToKey] || 1;
      rate = r1 * r2;
    }
  }

  // Cache rate
  ratesCache.set(cacheKey, rate);

  return amount * rate;
}

export async function addExchangeRateSnapshot(
  from: string,
  to: string,
  rate: number,
  source = "Manual",
  db = prisma
) {
  // Clear cache to enforce update
  const now = new Date();
  const cacheKey = `${from}_${to}_${now.toDateString()}`;
  ratesCache.delete(cacheKey);

  return db.exchangeRate.create({
    data: {
      fromCurrency: from,
      toCurrency: to,
      rate,
      source,
      date: now,
    },
  });
}

export async function getCurrencyAllocationSummary(
  userId: string,
  baseCurrency = "USD",
  db = prisma
): Promise<CurrencyAllocation[]> {
  const [accounts, assets, liabilities] = await Promise.all([
    db.account.findMany({ where: { userId, status: "Active" } }),
    db.asset.findMany({ where: { userId, status: "Active" } }),
    db.liability.findMany({ where: { userId, status: "Active" } }),
  ]);

  const currencyTotals = new Map<string, number>();

  // Add accounts
  for (const acc of accounts) {
    const val = toNumber(acc.currentBalance);
    const converted = await convertAmount(val, acc.currency, baseCurrency, new Date(), db);
    currencyTotals.set(acc.currency, (currencyTotals.get(acc.currency) || 0) + converted);
  }

  // Add assets
  for (const ass of assets) {
    const val = toNumber(ass.currentValue) * (parseFloat(ass.ownership) / 100);
    const converted = await convertAmount(val, ass.currency, baseCurrency, new Date(), db);
    currencyTotals.set(ass.currency, (currencyTotals.get(ass.currency) || 0) + converted);
  }

  // Subtract liabilities
  for (const liab of liabilities) {
    const val = toNumber(liab.outstandingBalance);
    const converted = await convertAmount(val, liab.currency, baseCurrency, new Date(), db);
    currencyTotals.set(liab.currency, (currencyTotals.get(liab.currency) || 0) - converted);
  }

  const grandTotal = Array.from(currencyTotals.values()).reduce((sum, v) => sum + v, 0);
  if (grandTotal === 0) return [];

  const allocation: CurrencyAllocation[] = [];
  currencyTotals.forEach((val, curr) => {
    allocation.push({
      currency: curr,
      totalValueBase: Math.round(val),
      percentage: Math.round((val / grandTotal) * 100),
    });
  });

  return allocation.sort((a, b) => b.totalValueBase - a.totalValueBase);
}
