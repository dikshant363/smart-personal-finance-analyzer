import { prisma } from "@/lib/prisma";

export interface WorkspaceSummary {
  workspaceId: string;
  name: string;
  type: string;
  role: string;
  membersCount: number;
}

export async function getWorkspacesSummary(
  userId: string,
  db = prisma
): Promise<WorkspaceSummary[]> {
  const memberships = await db.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          members: true,
        },
      },
    },
  });

  return memberships.map((m) => ({
    workspaceId: m.workspaceId,
    name: m.workspace.name,
    type: m.workspace.type,
    role: m.role,
    membersCount: m.workspace.members.length,
  }));
}

export async function createWorkspace(
  userId: string,
  name: string,
  type = "Personal",
  db = prisma
) {
  return db.$transaction(async (tx) => {
    const ws = await tx.workspace.create({
      data: {
        name,
        type,
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: ws.id,
        userId,
        role: "Owner",
      },
    });

    await tx.activityLog.create({
      data: {
        workspaceId: ws.id,
        userId,
        action: "Join",
        details: "Created workspace and joined as Owner.",
      },
    });

    return ws;
  });
}

export async function inviteWorkspaceMember(
  workspaceId: string,
  email: string,
  role: string,
  invitedById: string,
  db = prisma
) {
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: invitedById } },
  });

  if (!member || (member.role !== "Owner" && member.role !== "Administrator")) {
    throw new Error("Insufficient permission to invite members to this workspace");
  }

  const invitation = await db.workspaceInvitation.create({
    data: {
      workspaceId,
      email,
      role,
      status: "Pending",
      invitedById,
    },
  });

  await db.activityLog.create({
    data: {
      workspaceId,
      userId: invitedById,
      action: "Invite",
      details: `Invited user ${email} as ${role}.`,
    },
  });

  return invitation;
}

export async function respondToInvitation(
  invitationId: string,
  userId: string,
  userEmail: string,
  response: "Accept" | "Decline",
  db = prisma
) {
  return db.$transaction(async (tx) => {
    const invitation = await tx.workspaceInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.status !== "Pending") {
      throw new Error("Invitation not found or no longer pending");
    }

    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new Error("Invitation email address mismatch");
    }

    const updatedInvite = await tx.workspaceInvitation.update({
      where: { id: invitationId },
      data: { status: response === "Accept" ? "Accepted" : "Declined" },
    });

    if (response === "Accept") {
      await tx.workspaceMember.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId,
          role: invitation.role,
        },
      });

      await tx.activityLog.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId,
          action: "Join",
          details: `Accepted invitation and joined as ${invitation.role}.`,
        },
      });
    }

    return updatedInvite;
  });
}

export async function logWorkspaceActivity(
  workspaceId: string,
  userId: string,
  action: string,
  details: string,
  db = prisma
) {
  return db.activityLog.create({
    data: {
      workspaceId,
      userId,
      action,
      details,
    },
  });
}

export async function checkWorkspacePermission(
  workspaceId: string,
  userId: string,
  requiredPermission: "view" | "edit" | "admin",
  db = prisma
): Promise<boolean> {
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  if (!member) return false;

  const role = member.role;
  if (requiredPermission === "admin") {
    return role === "Owner" || role === "Administrator";
  }

  if (requiredPermission === "edit") {
    return (
      role === "Owner" ||
      role === "Administrator" ||
      role === "Editor" ||
      role === "Contributor"
    );
  }

  // view permission is satisfied by all roles
  return true;
}
