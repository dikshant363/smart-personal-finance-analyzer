import { describe, it, expect, vi, beforeEach } from "vitest";
import { publishEvent } from "./event-bus";
import { sendNotification } from "./notification";
import { registerJobHandler, runPendingSchedulerJobs } from "./scheduler";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    transaction: {
      aggregate: vi.fn(),
    },
    budget: {
      findFirst: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    workflowJob: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    workflowHistory: {
      create: vi.fn(),
    },
  },
}));

describe("Automation, Notification & Workflow Engine (ANWE) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("evaluates budget near_limit rule triggers on transaction creation", async () => {
    (prisma.budget.findFirst as any).mockResolvedValueOnce({
      id: "b1",
      name: "Food",
      amount: 100,
      category: { name: "Food" },
    });

    (prisma.transaction.aggregate as any).mockResolvedValueOnce({
      _sum: { amount: 95.0 }, // 95% of 100 limit
    });

    const event = {
      type: "transaction.created" as const,
      userId: "u1",
      payload: { id: "tx1", categoryId: "cat_food", amount: 10 },
    };

    const actionsTriggered = await publishEvent(event);

    expect(actionsTriggered).toBe(1);
    expect(prisma.notification.create).toHaveBeenCalled();
  });

  it("enforces alert deduplication within 60 seconds rate limit", async () => {
    const payload = {
      title: "Resilience Warning",
      body: "Emergency fund low",
      type: "warning" as const,
    };

    const firstSend = await sendNotification("u1", payload);
    const secondSend = await sendNotification("u1", payload);

    expect(firstSend).toBe(true);
    expect(secondSend).toBe(false); // Ignored due to deduplication check
  });

  it("executes registered cron job handlers via scheduler", async () => {
    const handlerSpy = vi.fn().mockResolvedValue({ count: 5 });
    registerJobHandler("Test Alert Check", handlerSpy);

    const mockJobs = [
      {
        id: "job1",
        name: "Test Alert Check",
        triggerType: "CRON",
        triggerName: "daily",
        status: "pending",
        runCount: 2,
        nextRun: new Date("2026-01-01"),
      },
    ];

    (prisma.workflowJob.findMany as any).mockResolvedValueOnce(mockJobs);

    await runPendingSchedulerJobs("u1");

    expect(handlerSpy).toHaveBeenCalledWith("u1");
    expect(prisma.workflowJob.update).toHaveBeenCalled();
    expect(prisma.workflowHistory.create).toHaveBeenCalled();
  });
});
