import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspacesSummary, createWorkspace } from "@/lib/workspace/engine";
import { WorkspaceClient } from "@/features/workspace/WorkspaceClient";

export default async function WorkspacesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let summary = await getWorkspacesSummary(user.id);

  // Seed default workspace if empty
  if (summary.length === 0) {
    await createWorkspace(user.id, "Household Core Space", "Family");
    summary = await getWorkspacesSummary(user.id);
  }

  // Get active workspace ID (default to first one)
  const activeWsId = summary[0]?.workspaceId;

  const [members, invites, logs] = await Promise.all([
    activeWsId
      ? prisma.workspaceMember.findMany({
          where: { workspaceId: activeWsId },
          include: { user: { select: { name: true, email: true } } },
        })
      : [],
    prisma.workspaceInvitation.findMany({
      where: { email: user.email.toLowerCase(), status: "Pending" },
      include: {
        workspace: { select: { name: true } },
        invitedBy: { select: { name: true, email: true } },
      },
    }),
    activeWsId
      ? prisma.activityLog.findMany({
          where: { workspaceId: activeWsId },
          orderBy: { createdAt: "desc" },
          take: 15,
        })
      : [],
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Household Workspace & Collaboration</h1>
      <WorkspaceClient
        initialSummary={summary}
        initialMembers={members}
        initialInvitations={invites}
        initialLogs={logs}
        currentUserEmail={user.email}
      />
    </div>
  );
}
