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

/** Creates a zero-value Transaction for optimistic UI before API response */
export function createOptimisticTransaction(
  partial: Partial<TransactionDTO> & { userId: string }
): TransactionDTO {
  const now = new Date().toISOString();
  return {
    id: `optimistic-${Date.now()}`,
    userId: partial.userId,
    amount: partial.amount ?? 0,
    currency: partial.currency ?? "USD",
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

/** Formats currency value using Intl */
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
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
