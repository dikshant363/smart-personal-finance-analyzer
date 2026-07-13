import { describe, it, expect, vi, beforeEach } from "vitest";
import { convertAmount, addExchangeRateSnapshot, getCurrencyAllocationSummary, clearRatesCache, resolveRate, convertWithMeta, getBaseCurrency, getLatestRateMap } from "./engine";
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
    profile: {
      findUnique: vi.fn(),
    },
  },
}));

beforeEach(() => {
  (prisma.exchangeRate.findFirst as any).mockReset();
  (prisma.exchangeRate.create as any).mockReset();
  (prisma.account.findMany as any).mockReset();
  (prisma.asset.findMany as any).mockReset();
  (prisma.liability.findMany as any).mockReset();
  (prisma.profile.findUnique as any).mockReset();
  clearRatesCache();
});

describe("Currency, Exchange Rate & Localization Platform (CERLP) Tests", () => {

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

describe("Sprint 9.9 — conversion metadata & helpers", () => {
  it("resolveRate returns identity rate for same currency", async () => {
    const result = await resolveRate("USD", "USD");
    expect(result).toEqual({ rate: 1, source: "Identity", rateDate: expect.any(Date) });
  });

  it("convertWithMeta converts using database rate and reports metadata", async () => {
    (prisma.exchangeRate.findFirst as any).mockResolvedValueOnce({
      rate: 1.15,
      fromCurrency: "EUR",
      toCurrency: "USD",
      date: new Date(),
    });

    const result = await convertWithMeta(100, "EUR", "USD");

    expect(result).toEqual({
      amount: 115,
      from: "EUR",
      to: "USD",
      rate: 1.15,
      converted: true,
      source: "Database",
      rateDate: expect.any(String),
    });
  });

  it("convertWithMeta preserves original amount when no rate is available", async () => {
    (prisma.exchangeRate.findFirst as any).mockResolvedValueOnce(null);

    const result = await convertWithMeta(100, "XYZ", "USD");

    expect(result).toEqual({
      amount: 100,
      from: "XYZ",
      to: "USD",
      rate: null,
      converted: false,
      source: "None",
      rateDate: null,
    });
  });

  it("getBaseCurrency returns profile currency", async () => {
    (prisma.profile.findUnique as any).mockResolvedValueOnce({ currency: "EUR" });

    const result = await getBaseCurrency("u1");

    expect(result).toBe("EUR");
  });

  it("getBaseCurrency defaults to INR", async () => {
    (prisma.profile.findUnique as any).mockResolvedValueOnce(null);

    const result = await getBaseCurrency("u1");

    expect(result).toBe("INR");
  });

  it("getLatestRateMap returns 1 for base and rates for others", async () => {
    (prisma.exchangeRate.findFirst as any).mockResolvedValue({
      rate: 1.08,
      fromCurrency: "EUR",
      toCurrency: "USD",
      date: new Date(),
    });

    const map = await getLatestRateMap("USD", ["USD", "EUR", "GBP"]);

    expect(map.get("USD")).toBe(1);
    expect(map.get("EUR")).toBeTypeOf("number");
    expect(map.get("GBP")).toBeTypeOf("number");
  });

  it("convertAmount behavior preserved (db rate)", async () => {
    (prisma.exchangeRate.findFirst as any).mockResolvedValueOnce({
      rate: 1.15,
      fromCurrency: "EUR",
      toCurrency: "USD",
      date: new Date(),
    });

    const result = await convertAmount(100, "EUR", "USD");

    expect(result).toBeCloseTo(115);
  });

  it("convertAmount behavior preserved (fallback)", async () => {
    (prisma.exchangeRate.findFirst as any).mockResolvedValueOnce(null);

    const result = await convertAmount(100, "EUR", "USD");

    expect(result).toBeCloseTo(108);
  });
});
