import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface InvitationInput {
  email: string;
  role: string; // "Financial Planner" | "Accountant" | "Lawyer" | "Family Member" | "Business Partner" | "Mentor" | "Custom"
  permissions: string[]; // e.g. ["View transactions", "View investments"]
}

export interface ReviewRequestInput {
  collaboratorId: string;
  title: string;
  description: string;
  module: string; // "Retirement" | "Investments" | "Tax" | "Insurance"
}

// 1. Audit Logging Service
export async function logCollaborationAudit(userId: string, action: string, details: string, db = prisma) {
  return db.collaborationAudit.create({
    data: {
      userId,
      action,
      details,
    },
  });
}

// 2. Permission Service
export async function checkCollaboratorPermission(
  collaboratorId: string,
  ownerId: string,
  requiredPermission: string,
  db = prisma
): Promise<boolean> {
  const share = await db.collaboratorShare.findFirst({
    where: {
      userId: ownerId,
      collaboratorId,
      status: "Active",
    },
  });

  if (!share) return false;

  const permissionsList = share.permissions.split(",");
  return permissionsList.includes(requiredPermission) || permissionsList.includes("All");
}

// 3. Invitation lifecycle management
export async function inviteCollaborator(userId: string, input: InvitationInput, db = prisma) {
  const token = crypto.randomBytes(32).toString("hex");

  const invitation = await db.collaborationInvitation.create({
    data: {
      userId,
      email: input.email,
      role: input.role,
      permissions: input.permissions.join(","),
      status: "Pending",
      token,
    },
  });

  await logCollaborationAudit(userId, "INVITATION_SENT", `Invited ${input.email} as ${input.role}`);
  return invitation;
}

export async function acceptInvitation(collaboratorId: string, token: string, db = prisma) {
  const invite = await db.collaborationInvitation.findUnique({
    where: { token },
  });

  if (!invite || invite.status !== "Pending") {
    throw new Error("Invalid or inactive invitation token");
  }

  // Create active share association
  const share = await db.collaboratorShare.create({
    data: {
      userId: invite.userId, // owner
      collaboratorId, // reviewer
      role: invite.role,
      permissions: invite.permissions,
      status: "Active",
    },
  });

  // Update invite status
  await db.collaborationInvitation.update({
    where: { id: invite.id },
    data: { status: "Accepted" },
  });

  await logCollaborationAudit(invite.userId, "INVITATION_ACCEPTED", `Invitation accepted by collaborator: ${collaboratorId}`);
  return share;
}

export async function revokeInvitation(userId: string, invitationId: string, db = prisma) {
  const invite = await db.collaborationInvitation.update({
    where: { id: invitationId },
    data: { status: "Revoked" },
  });

  await logCollaborationAudit(userId, "INVITATION_REVOKED", `Revoked invite to ${invite.email}`);
  return invite;
}

export async function getInvitations(userId: string, db = prisma) {
  return db.collaborationInvitation.findMany({
    where: { userId },
  });
}

export async function getCollaborators(userId: string, db = prisma) {
  return db.collaboratorShare.findMany({
    where: { userId },
  });
}

// 4. Review Request Service
export async function createReviewRequest(userId: string, input: ReviewRequestInput, db = prisma) {
  const request = await db.reviewRequest.create({
    data: {
      userId,
      collaboratorId: input.collaboratorId,
      title: input.title,
      description: input.description,
      module: input.module,
      status: "Pending",
    },
  });

  await logCollaborationAudit(userId, "REVIEW_REQUEST_CREATED", `Created review request: ${input.title}`);
  return request;
}

export async function addReviewComment(
  authorId: string,
  reviewRequestId: string,
  content: string,
  db = prisma
) {
  const comment = await db.collaborationComment.create({
    data: {
      reviewRequestId,
      authorId,
      content,
    },
  });

  await logCollaborationAudit(authorId, "COMMENT_ADDED", `Commented on review request: ${reviewRequestId}`);
  return comment;
}

export async function getReviewRequests(userId: string, db = prisma) {
  return db.reviewRequest.findMany({
    where: {
      OR: [
        { userId },
        { collaboratorId: userId }
      ]
    },
    include: {
      comments: true,
      user: {
        select: {
          id: true,
          email: true,
        }
      }
    }
  });
}

// 5. AI Discussion Summarizer helper
export function generateAICollaborationSummary(comments: any[]): string {
  if (comments.length === 0) {
    return "No comments logged in this discussion thread.";
  }

  const commentLogs = comments
    .map((c) => `- Comment by User ${c.authorId}: "${c.content}"`)
    .join("\n");

  return `### AI Collaboration Discussion Summary
The following comments were compiled from this review request thread:

${commentLogs}

*Notice: This summary is generated from user discussion entries for educational clarification. The AI does not express opinions, endorse any participant, or provide legal or tax recommendations.*`;
}
