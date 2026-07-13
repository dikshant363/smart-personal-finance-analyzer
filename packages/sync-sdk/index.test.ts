import { describe, it, expect, vi } from "vitest";
import { SyncQueueManager } from "./index";

describe("@finance/sync-sdk", () => {
  it("enqueues and processes sync queue items sequentially", async () => {
    const manager = new SyncQueueManager("user1");
    manager.clearQueue();
    expect(manager.getQueue().length).toBe(0);

    manager.enqueue("CREATE", "transaction", { amount: 100 });
    manager.enqueue("CREATE", "transaction", { amount: 200 });

    expect(manager.getQueue().length).toBe(2);

    const executor = vi.fn().mockResolvedValue(true);
    const result = await manager.sync(executor);

    expect(result.processed).toBe(2);
    expect(result.failed).toBe(0);
    expect(manager.getQueue().length).toBe(0);
  });
});
