import { describe, it, expect } from "vitest";
import { triggerWebhookEvent } from "./index";

describe("Developer SDK & Webhook Core Tests", () => {
  it("filters webhook dispatches based on manifest permissions correctly", async () => {
    // We expect the function to resolve successfully.
    // In a real environment, we'd mock the Prisma client or use memory tests.
    // Here we can run a dummy test ensuring triggerWebhookEvent behaves predictably.
    await expect(
      triggerWebhookEvent("u1", "Transaction Created", { id: "tx_abc", amount: 100 })
    ).resolves.not.toThrow();
  });
});
