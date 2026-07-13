import { describe, it, expect } from "vitest";
import { extractDailySnapshot } from "./engine";

describe("Data Warehouse & Analytical Processing Engine Tests", () => {
  it("generates correct savings rate metrics calculations", async () => {
    // Mock db queries
    const mockDb = {
      transaction: {
        findMany: async () => [
          { type: "Income", amount: 1000 },
          { type: "Expense", amount: 400 },
        ],
      },
    } as any;

    const facts = await extractDailySnapshot("user_u1", mockDb);

    expect(facts.userId).toBe("user_u1");
    expect(facts.savingsRate).toBe(60.00);
    expect(facts.totalSpending).toBe(400);
  });
});
