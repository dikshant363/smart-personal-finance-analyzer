import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../prisma";

export function toNumber(value: Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return Number(value.toNumber());
}

import { getActiveConfig } from "@finance/shared-config";

export function formatMoney(
  amount: number | string,
  currency?: string,
  locale?: string
): string {
  const config = getActiveConfig();
  const targetCurrency = currency ?? config.currency.code;
  const targetLocale = locale ?? config.localization.defaultLocale;
  return new Intl.NumberFormat(targetLocale, { style: "currency", currency: targetCurrency }).format(Number(amount));
}

export interface CurrencyAllocation {
  currency: string;
  totalValueBase: number;
  percentage: number;
}

export type RateSource = "Database" | "Fallback" | "Bridge" | "Identity" | "None";

export interface ResolvedRate {
  rate: number;
  source: RateSource;
  rateDate: Date;
}

export interface ConversionResult {
  amount: number;
  from: string;
  to: string;
  rate: number | null;
  converted: boolean;
  source: RateSource;
  rateDate: string | null;
}

// In-memory conversion rates cache (keyed by from_to_datestring)
const ratesCache = new Map<string, ResolvedRate | null>();

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

function cacheKeyFor(from: string, to: string, date: Date): string {
  return `${from}_${to}_${date.toDateString()}`;
}

/**
 * Resolve the exchange rate from `from` to `to` as of `date`.
 * Order: identity -> cache -> database (most recent rate <= date) -> in-memory fallback -> USD bridge.
 * Returns null when no rate can be determined.
 */
export async function resolveRate(
  from: string,
  to: string,
  date = new Date(),
  db = prisma
): Promise<ResolvedRate | null> {
  if (from === to) {
    return { rate: 1, source: "Identity", rateDate: date };
  }

  const cacheKey = cacheKeyFor(from, to, date);
  if (ratesCache.has(cacheKey)) {
    return ratesCache.get(cacheKey) ?? null;
  }

  // Database lookup: most recent rate on or before `date`
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
      const resolved: ResolvedRate = {
        rate: toNumber(record.rate),
        source: "Database",
        rateDate: record.date ?? date,
      };
      ratesCache.set(cacheKey, resolved);
      return resolved;
    }
  } catch (err) {
    console.error("Exchange rate query error:", err);
  }

  // In-memory fallback rates
  const directKey = `${from}_${to}`;
  let rate = FALLBACK_RATES[directKey] || 0;
  let source: RateSource = "Fallback";

  if (rate === 0) {
    // Try to bridge via USD
    const r1 = from === "USD" ? 1 : FALLBACK_RATES[`${from}_USD`];
    const r2 = to === "USD" ? 1 : FALLBACK_RATES[`USD_${to}`];
    if (r1 !== undefined && r2 !== undefined) {
      rate = r1 * r2;
    }
  }

  if (rate === 0) {
    ratesCache.set(cacheKey, null);
    return null;
  }

  const resolved: ResolvedRate = { rate, source, rateDate: date };
  ratesCache.set(cacheKey, resolved);
  return resolved;
}

export async function convertAmount(
  amount: number,
  from: string,
  to: string,
  date = new Date(),
  db = prisma
): Promise<number> {
  if (from === to) return amount;
  const resolved = await resolveRate(from, to, date, db);
  return amount * (resolved?.rate ?? 0);
}

export async function addExchangeRateSnapshot(
  from: string,
  to: string,
  rate: number,
  source = "Manual",
  db = prisma
) {
  const now = new Date();
  const cacheKey = cacheKeyFor(from, to, now);
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

/**
 * Convert `amount` from `from` to `to`, returning metadata about the conversion.
 * Gracefully handles missing rates: when no rate is available the original amount
 * is returned unchanged with `converted: false` (never fabricates a value).
 */
export async function convertWithMeta(
  amount: number,
  from: string,
  to: string,
  date = new Date(),
  db = prisma
): Promise<ConversionResult> {
  const base: ConversionResult = {
    amount,
    from,
    to,
    rate: null,
    converted: false,
    source: "None",
    rateDate: null,
  };

  if (from === to) {
    return { ...base, rate: 1, converted: true, source: "Identity", rateDate: date.toISOString() };
  }

  const resolved = await resolveRate(from, to, date, db);
  if (!resolved) return base;

  // A USD-bridge rate of exactly 1 means neither leg had real data; treat as unconverted.
  const genuine = resolved.source !== "Bridge" || resolved.rate !== 1;
  if (!genuine) return base;

  return {
    amount: Math.round(amount * resolved.rate * 100) / 100,
    from,
    to,
    rate: resolved.rate,
    converted: true,
    source: resolved.source,
    rateDate: resolved.rateDate.toISOString(),
  };
}

/** Returns the user's base/default currency from their Profile, defaulting to config currency. */
export async function getBaseCurrency(userId: string, db = prisma): Promise<string> {
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { currency: true },
  });
  return profile?.currency ?? getActiveConfig().currency.code;
}

/**
 * Resolve conversion rates from each distinct source currency to `baseCurrency`
 * as of `date`, in a bounded number of queries (one per distinct currency).
 * Returns a map currency -> rate (null when no rate is available).
 */
export async function getLatestRateMap(
  baseCurrency: string,
  currencies: string[],
  date = new Date(),
  db = prisma
): Promise<Map<string, number | null>> {
  const map = new Map<string, number | null>();
  for (const currency of new Set(currencies)) {
    if (currency === baseCurrency) {
      map.set(currency, 1);
      continue;
    }
    const resolved = await resolveRate(currency, baseCurrency, date, db);
    const genuine = resolved && (resolved.source !== "Bridge" || resolved.rate !== 1);
    map.set(currency, genuine ? resolved!.rate : null);
  }
  return map;
}

export interface BaseCurrencyEnriched<T> {
  amountBase: number;
  rate: number | null;
  converted: boolean;
  baseCurrency: string;
}

/**
 * Attach base-currency conversion to a list of items that each carry an `amount`
 * and `currency`. Uses a bounded number of rate lookups (one per distinct currency).
 * The original `amount`/`currency` are never mutated; `amountBase` mirrors `amount`
 * when no rate is available.
 */
export async function withBaseCurrency<T extends { amount: number; currency: string }>(
  items: T[],
  baseCurrency: string,
  db = prisma
): Promise<(T & BaseCurrencyEnriched<T>)[]> {
  const rateMap = await getLatestRateMap(
    baseCurrency,
    items.map((i) => i.currency),
    new Date(),
    db
  );
  return items.map((item) => {
    const rate = rateMap.get(item.currency) ?? null;
    const converted = rate !== null;
    return {
      ...item,
      amountBase: converted ? item.amount * rate! : item.amount,
      rate,
      converted,
      baseCurrency,
    };
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

  for (const acc of accounts) {
    const val = toNumber(acc.currentBalance);
    const converted = await convertAmount(val, acc.currency, baseCurrency, new Date(), db);
    currencyTotals.set(acc.currency, (currencyTotals.get(acc.currency) || 0) + converted);
  }

  for (const ass of assets) {
    const val = toNumber(ass.currentValue) * (parseFloat(ass.ownership) / 100);
    const converted = await convertAmount(val, ass.currency, baseCurrency, new Date(), db);
    currencyTotals.set(ass.currency, (currencyTotals.get(ass.currency) || 0) + converted);
  }

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
