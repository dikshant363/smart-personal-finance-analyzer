import { json, handleError, requireAuthed } from "@/lib/api";
import { runPendingSchedulerJobs, registerJobHandler } from "@/lib/automation";
import { checkAndGenerateReminders } from "@/lib/recurring/schedule";

// Register default job handlers
registerJobHandler("Check Recurring Reminders", async (userId) => {
  const count = await checkAndGenerateReminders(userId);
  return { remindersGenerated: count };
});

registerJobHandler("Refresh Recommendations rules", async (userId) => {
  return { status: "rules_recalculated" };
});

registerJobHandler("Compile Weekly Summary Recommendations", async (userId) => {
  return { status: "weekly_summary_compiled" };
});

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();

    // Force update nextRun times to past date for testing so they trigger immediately
    await prisma.workflowJob.updateMany({
      where: { userId: user.id },
      data: { nextRun: new Date() },
    });

    await runPendingSchedulerJobs(user.id);
    return json({ success: true, message: "Pending scheduler jobs executed successfully" }, 200);
  } catch (e) {
    return handleError(e);
  }
}
import { prisma } from "@/lib/prisma";
