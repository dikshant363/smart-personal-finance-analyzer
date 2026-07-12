import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const url = new URL(req.url);
    const workspaceId = url.searchParams.get("workspaceId");

    if (!workspaceId) {
      return error("workspaceId query param is required", 400);
    }

    // Verify membership
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
    });

    if (!member) {
      return error("Access denied", 403);
    }

    const activity = await prisma.activityLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return json({ activity }, 200);
  } catch (e) {
    return handleError(e);
  }
}
