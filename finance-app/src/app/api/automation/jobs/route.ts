import { json, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { createScheduledJob } from "@/lib/automation";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    // Auto seed default demo jobs if none exist
    let jobs = await prisma.workflowJob.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    });

    if (jobs.length === 0) {
      await Promise.all([
        createScheduledJob(user.id, "Check Recurring Reminders", "0 9 * * * (daily)"),
        createScheduledJob(user.id, "Refresh Recommendations rules", "0 0 * * * (daily)"),
        createScheduledJob(user.id, "Compile Weekly Summary Recommendations", "0 0 * * 0 (weekly)"),
      ]);

      jobs = await prisma.workflowJob.findMany({
        where: { userId: user.id },
        orderBy: { name: "asc" },
      });
    }

    return json({ jobs }, 200);
  } catch (e) {
    return handleError(e);
  }
}
