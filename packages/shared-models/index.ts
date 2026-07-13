import type {
  TransactionDTO,
  BudgetDTO,
  GoalDTO,
  UserDTO,
  AssetDTO,
  LiabilityDTO,
} from "@finance/shared-types";

/**
 * Shared Business Domain Models — Package: @finance/shared-models
 * Transformation utilities converting API responses to typed DTOs.
 */

export type { TransactionDTO, BudgetDTO, GoalDTO, UserDTO, AssetDTO, LiabilityDTO };

export function createOptimisticTransaction(
  partial: Partial<TransactionDTO> & { userId: string }
): TransactionDTO {
  const config = getActiveConfig();
  const now = new Date().toISOString();
  return {
    id: `optimistic-${Date.now()}`,
    userId: partial.userId,
    amount: partial.amount ?? 0,
    currency: partial.currency ?? config.currency.code,
    type: partial.type ?? "Expense",
    description: partial.description ?? "",
    date: partial.date ?? now,
    categoryId: partial.categoryId ?? null,
    categoryName: partial.categoryName ?? null,
    source: "Manual",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

/** Computes total spent across a list of transactions for a given category */
export function sumByCategory(
  transactions: TransactionDTO[],
  categoryId: string
): number {
  return transactions
    .filter((t) => t.categoryId === categoryId && t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Net worth calculation from assets and liabilities */
export function calculateNetWorth(
  assets: AssetDTO[],
  liabilities: LiabilityDTO[]
): number {
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0);
  return totalAssets - totalLiabilities;
}

import { getActiveConfig } from "../shared-config/index";

/** Formats currency value using Intl and CountryConfig defaults */
export function formatCurrency(
  amount: number,
  currency?: string,
  locale?: string
): string {
  const config = getActiveConfig();
  const targetCurrency = currency ?? config.currency.code;
  const targetLocale = locale ?? config.localization.defaultLocale;

  return new Intl.NumberFormat(targetLocale, {
    style: "currency",
    currency: targetCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}


/** Calculates goal progress as a percentage (0-100) */
export function goalProgressPercent(goal: GoalDTO): number {
  if (goal.targetAmount === 0) return 0;
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
}

/** Budget utilization percentage */
export function budgetUtilization(budget: BudgetDTO): number {
  if (budget.amount === 0) return 0;
  return Math.min(100, Math.round((budget.spent / budget.amount) * 100));
}
