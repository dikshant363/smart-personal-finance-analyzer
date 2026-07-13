import { describe, it, expect } from "vitest";
import { verifyWebhookSignature, checkApiRateLimit } from "./engine";

describe("Financial Integration Webhooks & Rate Limits Tests", () => {
  it("verifies webhook payload signatures deterministically", () => {
    const isOk = verifyWebhookSignature("payload_data", "sha256_mock_key_12", "key");
    expect(isOk).toBe(true);
  });

  it("enforces API rate limits correctly", () => {
    const check1 = checkApiRateLimit(45, 100);
    const check2 = checkApiRateLimit(120, 100);

    expect(check1.allowed).toBe(true);
    expect(check1.remaining).toBe(55);
    expect(check2.allowed).toBe(false);
    expect(check2.remaining).toBe(0);
  });
});
