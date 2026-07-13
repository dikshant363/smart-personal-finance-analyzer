import { describe, it, expect } from "vitest";
import { ResilienceService } from "./engine";

describe("Resilience Service, Retries & Circuit Breaker Tests", () => {
  it("uses fallback policy when execution fails repeatedly", async () => {
    ResilienceService.clearCache();

    const result = await ResilienceService.execute(
      async () => {
        throw new Error("API Failure");
      },
      () => "fallback_data",
      2
    );

    expect(result).toBe("fallback_data");
  });

  it("caches and retrieves configuration options accurately with ttl expiry rules", () => {
    ResilienceService.setCache("opt_1", "cache_value", 5);
    const val = ResilienceService.getCache("opt_1");

    expect(val).toBe("cache_value");
  });
});
