import { describe, it, expect } from "vitest";
import { isMobileUserAgent } from "./engine";
import { secureStorage, isBiometricsAvailable, copyToClipboard } from "./device";

describe("Multi-Platform PWA & Mobile UX Layout Tests", () => {
  it("determines user agent checks safely inside node/jsdom environments", () => {
    const isMobile = isMobileUserAgent();
    expect(typeof isMobile).toBe("boolean");
  });

  it("performs secure storage set, get, and delete operations", async () => {
    await secureStorage.setItem("test_key", "secret_value");
    const val = await secureStorage.getItem("test_key");
    expect(val).toBe("secret_value");
    await secureStorage.removeItem("test_key");
    const deleted = await secureStorage.getItem("test_key");
    expect(deleted).toBeNull();
  });

  it("handles biometrics capability checks without throwing errors", async () => {
    const isAvailable = await isBiometricsAvailable();
    expect(typeof isAvailable).toBe("boolean");
  });

  it("executes copy to clipboard requests", async () => {
    const copied = await copyToClipboard("test clipboard copy");
    expect(typeof copied).toBe("boolean");
  });
});
