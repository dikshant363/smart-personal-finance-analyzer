import { prisma } from "@/lib/prisma";

export type JobHandler = (userId: string) => Promise<any>;

const jobHandlersRegistry = new Map<string, JobHandler>();

export function registerJobHandler(name: string, handler: JobHandler) {
  jobHandlersRegistry.set(name, handler);
}

export async function createScheduledJob(
  userId: string,
  name: string,
  cronExpression: string
) {
  const nextRun = calculateNextRun(cronExpression);

  return prisma.workflowJob.create({
    data: {
      userId,
      name,
      triggerType: "CRON",
      triggerName: cronExpression,
      status: "pending",
      nextRun,
    },
  });
}

export async function runPendingSchedulerJobs(userId: string) {
  const now = new Date();
  const pending = await prisma.workflowJob.findMany({
    where: {
      userId,
      status: { in: ["pending", "success", "failed"] },
      nextRun: { lte: now },
    },
  });

  for (const job of pending) {
    const handler = jobHandlersRegistry.get(job.name);
    if (!handler) continue;

    // Update status to running
    await prisma.workflowJob.update({
      where: { id: job.id },
      data: { status: "running" },
    });

    const startTime = Date.now();
    let status = "success";
    let errorMsg: string | null = null;

    try {
      await handler(userId);
    } catch (err) {
      status = "failed";
      errorMsg = err instanceof Error ? err.message : String(err);
    }

    const duration = Date.now() - startTime;
    const nextRun = calculateNextRun(job.triggerName);

    // Save job status updates
    await prisma.workflowJob.update({
      where: { id: job.id },
      data: {
        status,
        runCount: job.runCount + 1,
        lastRun: now,
        nextRun,
        errorMessage: errorMsg,
      },
    });

    // Save in execution history
    await prisma.workflowHistory.create({
      data: {
        userId,
        jobName: job.name,
        actionType: "CRON_EXECUTION",
        status,
        durationMs: duration,
        errorMessage: errorMsg,
      },
    });
  }
}

// Simulated simple cron calculator (returns +24h for daily summaries, etc.)
function calculateNextRun(cron: string): Date {
  const date = new Date();
  if (cron.includes("daily") || cron.includes("0 0 * * *")) {
    date.setDate(date.getDate() + 1);
  } else if (cron.includes("weekly") || cron.includes("0 0 * * 0")) {
    date.setDate(date.getDate() + 7);
  } else {
    date.setMinutes(date.getMinutes() + 10); // default 10 minutes interval for stubs
  }
  return date;
}
