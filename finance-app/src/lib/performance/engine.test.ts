import { describe, it, expect, beforeEach } from "vitest";
import { PerformanceManager } from "./engine";

describe("Performance & Scalability Platform (PSP) Tests", () => {
  beforeEach(() => {
    PerformanceManager.clearCache();
  });

  it("caches elements under correct TTL expiration rules", () => {
    PerformanceManager.setCachedItem("myKey", "myVal", 5000);
    const cached = PerformanceManager.getCachedItem("myKey");
    expect(cached).toBe("myVal");
  });

  it("returns null if TTL cache expiration exceeds duration limit", () => {
    PerformanceManager.setCachedItem("myKey", "myVal", -100);
    const cached = PerformanceManager.getCachedItem("myKey");
    expect(cached).toBeNull();
  });

  it("stores and aggregates performance metric durations correctly", () => {
    PerformanceManager.logMetric("DbQuery", 120);
    PerformanceManager.logMetric("DbQuery", 80);

    const summary = PerformanceManager.getMetricsSummary();
    expect(summary["DbQuery"]).toBeDefined();
    expect(summary["DbQuery"].count).toBe(2);
    expect(summary["DbQuery"].avgDurationMs).toBe(100);
  });
});
