import { describe, it, expect, vi } from "vitest";
import { eventBus } from "./engine";

describe("Domain Event Streaming Bus Platform Tests", () => {
  it("dispatches published transaction_created events to registered listeners", async () => {
    eventBus.clear();
    const handler = vi.fn();

    eventBus.subscribe("transaction_created", handler);

    const event = {
      id: "evt_1",
      type: "transaction_created",
      version: "1.0",
      timestamp: new Date().toISOString(),
      workspaceId: "ws_default",
      payload: { amount: 150 },
    };

    await eventBus.publish(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
    expect(eventBus.getStore().length).toBe(1);
  });
});
