import { prisma } from "@/lib/prisma";

export function sanitizeInputString(val: string): string {
  // Strip script tags and their content, then strip generic HTML tags
  return val
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>?/gm, "")
    .trim();
}

export async function verifyWorkspaceResourceAccess(
  userId: string,
  workspaceId: string | null,
  db = prisma
): Promise<boolean> {
  if (!workspaceId) {
    // If no workspace is specified on the resource, it is a personal scope
    return true;
  }

  const membership = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!membership) {
    // Log security access violation
    await db.activityLog.create({
      data: {
        workspaceId,
        userId,
        action: "SecurityViolation",
        details: "Unauthorized attempt to access workspace resource.",
      },
    });
    return false;
  }

  return true;
}
