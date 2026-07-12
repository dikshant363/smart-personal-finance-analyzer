import { describe, it, expect, vi, beforeEach } from "vitest";
import { queueOfflineAction, processOfflineSyncQueue } from "./engine";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    offlineSyncQueue: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    transaction: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("Platform Experience & Offline Intelligence Platform (PEOIP) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queues actions and writes them to local sync registry", async () => {
    const payload = { description: "Fuel", amount: 65 };
    await queueOfflineAction("u1", "CreateTransaction", payload, prisma);

    expect(prisma.offlineSyncQueue.create).toHaveBeenCalledWith({
      data: {
        userId: "u1",
        action: "CreateTransaction",
        payload: JSON.stringify(payload),
        status: "Pending",
      },
    });
  });

  it("processes queue and creates transactions in db while filtering duplicates", async () => {
    const pendingItem = {
      id: "item1",
      action: "CreateTransaction",
      payload: JSON.stringify({ amount: 150, description: "Costco Grocery", type: "Expense" }),
      status: "Pending",
    };

    (prisma.offlineSyncQueue.findMany as any).mockResolvedValueOnce([pendingItem]);
    // Simulate duplicate check matching record
    (prisma.transaction.findFirst as any).mockResolvedValueOnce({ id: "t1" });

    const stats = await processOfflineSyncQueue("u1", prisma);

    expect(stats.syncedCount).toBe(1);
    expect(stats.duplicateCount).toBe(1);
    expect(prisma.transaction.create).not.toHaveBeenCalled();
  });
});
