/**
 * Shared Types Package Tests
 * @finance/shared-types validation
 */
import { describe, it, expect } from "vitest";
import type {
  TransactionDTO,
  BudgetDTO,
  GoalDTO,
  ApiResponse,
  PaginatedResponse,
} from "./index";
import {
  calculateNetWorth,
  formatCurrency,
  goalProgressPercent,
  budgetUtilization,
  createOptimisticTransaction,
} from "../shared-models/index";
import { isValidISODate, isValidCurrencyCode, isValidAmount } from "../shared-validation/index";

describe("@finance/shared-types", () => {
  it("TransactionDTO structure is valid", () => {
    const t: TransactionDTO = {
      id: "txn-1",
      userId: "user-1",
      amount: 100,
      currency: "USD",
      type: "Expense",
      description: "Coffee",
      date: new Date().toISOString(),
      categoryId: "cat-1",
      categoryName: "Food",
      source: "Manual",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(t.type).toBe("Expense");
    expect(t.source).toBe("Manual");
  });

  it("ApiResponse wraps data correctly", () => {
    const response: ApiResponse<TransactionDTO[]> = {
      ok: true,
      data: [],
    };
    expect(response.ok).toBe(true);
    expect(response.data).toEqual([]);
  });

  it("PaginatedResponse has correct structure", () => {
    const paged: PaginatedResponse<TransactionDTO> = {
      ok: true,
      data: [],
      pagination: { total: 0, page: 1, limit: 20, hasMore: false },
    };
    expect(paged.pagination.page).toBe(1);
  });
});

describe("@finance/shared-models", () => {
  it("calculateNetWorth returns assets minus liabilities", () => {
    const assets = [{ id: "a1", userId: "u1", name: "Car", type: "Vehicle", value: 20000, currency: "USD" }];
    const liabilities = [{ id: "l1", userId: "u1", name: "Loan", type: "Loan", balance: 5000, interestRate: 5, minimumPayment: 200 }];
    expect(calculateNetWorth(assets, liabilities)).toBe(15000);
  });

  it("formatCurrency formats amounts correctly", () => {
    expect(formatCurrency(1000, "USD")).toBe("$1,000.00");
  });

  it("goalProgressPercent is capped at 100", () => {
    const goal: GoalDTO = { id: "g1", userId: "u1", name: "Savings", targetAmount: 1000, currentAmount: 1500, deadline: null, category: "Savings", status: "Active" };
    expect(goalProgressPercent(goal)).toBe(100);
  });

  it("budgetUtilization calculates percent correctly", () => {
    const budget: BudgetDTO = { id: "b1", userId: "u1", categoryId: null, name: "Groceries", amount: 500, spent: 250, period: "Monthly", startDate: "2026-07-01", endDate: null };
    expect(budgetUtilization(budget)).toBe(50);
  });

  it("createOptimisticTransaction generates optimistic ID", () => {
    const t = createOptimisticTransaction({ userId: "u1", amount: 50, type: "Expense" });
    expect(t.id).toMatch(/^optimistic-/);
    expect(t.amount).toBe(50);
  });
});

describe("@finance/shared-validation", () => {
  it("isValidISODate accepts valid dates", () => {
    expect(isValidISODate("2026-01-01T00:00:00Z")).toBe(true);
  });

  it("isValidISODate rejects invalid strings", () => {
    expect(isValidISODate("not-a-date")).toBe(false);
  });

  it("isValidCurrencyCode accepts 3-letter uppercase codes", () => {
    expect(isValidCurrencyCode("USD")).toBe(true);
    expect(isValidCurrencyCode("EUR")).toBe(true);
    expect(isValidCurrencyCode("us")).toBe(false);
  });

  it("isValidAmount accepts valid amounts", () => {
    expect(isValidAmount(100)).toBe(true);
    expect(isValidAmount(0)).toBe(false);
    expect(isValidAmount(-1)).toBe(false);
  });
});
