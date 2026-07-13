import { describe, it, expect } from "vitest";
import { getActiveConfig, INDPack } from "./index";

describe("@finance/shared-config", () => {
  it("defaults to India (IN) pack", () => {
    const config = getActiveConfig();
    expect(config.countryCode).toBe("IN");
    expect(config.currency.code).toBe("INR");
    expect(config.currency.symbol).toBe("₹");
    expect(config.localization.defaultLocale).toBe("en-IN");
  });

  it("includes Indian financial year starting April 1st", () => {
    const config = getActiveConfig();
    expect(config.financialYear.startMonth).toBe(4);
    expect(config.financialYear.startDay).toBe(1);
    expect(config.financialYear.endMonth).toBe(3);
    expect(config.financialYear.endDay).toBe(31);
  });

  it("supports Indian financial products and payment systems", () => {
    const config = getActiveConfig();
    expect(config.paymentSystems).toContain("UPI");
    expect(config.investmentProducts).toContain("Public Provident Fund (PPF)");
    expect(config.investmentProducts).toContain("Employees' Provident Fund (EPF)");
    expect(config.investmentProducts).toContain("National Pension System (NPS)");
    expect(config.investmentProducts).toContain("SIP");
  });
});
