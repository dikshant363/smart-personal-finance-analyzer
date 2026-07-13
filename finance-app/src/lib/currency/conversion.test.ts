import { describe, it, expect, vi, beforeEach } from "vitest";
import { convertWithMeta, getBaseCurrency, getLatestRateMap, resolveRate, clearRatesCache } from "./engine";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    exchangeRate: {
      findFirst: vi.fn(),
    },
    profile: {
      findUnique: vi.fn(),
    },
  },
}));

describe("Sprint 9.9 — integration-style conversion tests", () => {
  beforeEach(() => {
    (prisma.exchangeRate.findFirst as any).mockReset();
    (prisma.profile.findUnique as any).mockReset();
    clearRatesCache();
  });

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

  it("getBaseCurrency defaults to USD", async () => {
    (prisma.profile.findUnique as any).mockResolvedValueOnce(null);

    const result = await getBaseCurrency("u1");

    expect(result).toBe("USD");
  });

  it("getLatestRateMap returns 1 for base and rates for others", async () => {
    (prisma.exchangeRate.findFirst as any).mockResolvedValueOnce({
      rate: 1.08,
      fromCurrency: "EUR",
      toCurrency: "USD",
      date: new Date(),
    });

    const map = await getLatestRateMap("USD", ["USD", "EUR", "GBP"]);

    expect(map.get("USD")).toBe(1);
    expect(map.get("EUR")).toBeCloseTo(1.08);
    expect(map.get("GBP")).toBeCloseTo(1.27);
  });
});
