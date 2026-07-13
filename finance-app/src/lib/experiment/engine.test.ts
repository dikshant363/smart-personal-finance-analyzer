import { describe, it, expect } from "vitest";
import { computeRolloutBucket } from "./engine";

describe("A/B Testing & Percentage Rollout Engine Tests", () => {
  it("generates stable deterministic rollout buckets for user IDs", () => {
    const bucket1 = computeRolloutBucket("user_u1", "feat_a");
    const bucket2 = computeRolloutBucket("user_u1", "feat_a");
    const bucket3 = computeRolloutBucket("user_u2", "feat_a");

    expect(bucket1).toBe(bucket2);
    expect(bucket1).toBeLessThan(100);
    expect(bucket1).toBeGreaterThanOrEqual(0);
    expect(bucket3).toBeLessThan(100);
  });
});
