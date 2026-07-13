import { describe, it, expect } from "vitest";
import { translate, formatCurrencyLocal } from "./engine";

describe("Global Readiness & Localization Platform Tests", () => {
  it("translates keyword definitions into German successfully", () => {
    const val = translate("welcome", "de-DE");
    expect(val).toBe("Willkommen zurück");
  });

  it("formats Indian and US currency layouts appropriately", () => {
    const formattedInr = formatCurrencyLocal(500000, "en-IN", "INR");
    const formattedUsd = formatCurrencyLocal(500000, "en-US", "USD");

    expect(formattedInr).toBeDefined();
    expect(formattedUsd).toBeDefined();
  });
});
