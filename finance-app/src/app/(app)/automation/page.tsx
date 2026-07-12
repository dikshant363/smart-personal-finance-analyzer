import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNotifications } from "@/lib/automation";
import { AutomationClient } from "@/components/automation/automation-client";

export default async function AutomationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Load notifications, jobs, and history
  const [notifications, jobs, history] = await Promise.all([
    getNotifications(user.id),
    prisma.workflowJob.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
    prisma.workflowHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Workflow Automation & Notification Center</h1>
      <AutomationClient
        initialNotifications={notifications}
        initialJobs={jobs}
        initialHistory={history}
      />
    </div>
  );
}
