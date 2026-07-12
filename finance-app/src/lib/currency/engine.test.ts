import { describe, it, expect, vi, beforeEach } from "vitest";
import { convertAmount, addExchangeRateSnapshot, getCurrencyAllocationSummary, clearRatesCache } from "./engine";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    exchangeRate: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    account: {
      findMany: vi.fn(),
    },
    asset: {
      findMany: vi.fn(),
    },
    liability: {
      findMany: vi.fn(),
    },
  },
}));

describe("Currency, Exchange Rate & Localization Platform (CERLP) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRatesCache();
  });

  it("converts amount using database record when available", async () => {
    (prisma.exchangeRate.findFirst as any).mockResolvedValueOnce({
      rate: 1.15,
      fromCurrency: "EUR",
      toCurrency: "USD",
    });

    const result = await convertAmount(100, "EUR", "USD");

    expect(result).toBeCloseTo(115);
  });

  it("falls back to memory configurations if database record is missing", async () => {
    (prisma.exchangeRate.findFirst as any).mockResolvedValueOnce(null);

    // Memory fallback EUR to USD is 1.08
    const result = await convertAmount(100, "EUR", "USD");

    expect(result).toBeCloseTo(108);
  });

  it("calculates weighted currency allocation exposures relative to base currency", async () => {
    (prisma.account.findMany as any).mockResolvedValueOnce([
      { id: "a1", currentBalance: 2000, currency: "USD", status: "Active" }, // 2000 USD
      { id: "a2", currentBalance: 1000, currency: "EUR", status: "Active" }, // 1080 USD
    ]);

    (prisma.asset.findMany as any).mockResolvedValueOnce([]);
    (prisma.liability.findMany as any).mockResolvedValueOnce([]);
    (prisma.exchangeRate.findFirst as any).mockResolvedValue(null); // use memory rates

    const alloc = await getCurrencyAllocationSummary("u1", "USD");

    expect(alloc.length).toBe(2);
    expect(alloc[0].currency).toBe("USD");
    expect(alloc[1].currency).toBe("EUR");
    // 2000 USD vs 1080 USD -> USD = ~65%, EUR = ~35%
    expect(alloc[0].percentage).toBeGreaterThanOrEqual(60);
  });
});
