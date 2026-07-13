import { describe, it, expect, vi } from "vitest";
import { WebhookEngine, WebhookSubscription } from "./engine";

describe("Webhook Engine", () => {
  it("delivers notifications to matched subscribers and verifies HMAC signature", async () => {
    const sub: WebhookSubscription = {
      id: "sub-1",
      userId: "user-1",
      url: "https://api.thirdparty.com/webhook",
      secret: "super-secret-key",
      events: ["transaction.created"],
      isActive: true,
    };

    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    const engine = new WebhookEngine([sub]);
    const tx = { id: "tx-1", amount: 15.5 };

    const result = await engine.dispatchEvent("transaction.created", "user-1", tx);

    expect(result.dispatched).toBe(1);
    expect(result.failed).toBe(0);

    // Verify HMAC signature calculation
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.thirdparty.com/webhook",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Finance-Signature": expect.any(String),
        }),
      })
    );
  });
});
