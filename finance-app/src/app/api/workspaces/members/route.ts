import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { inviteWorkspaceMember } from "@/lib/workspace/engine";
import { z } from "zod";

const inviteSchema = z.object({
  workspaceId: z.string(),
  email: z.string().email(),
  role: z.string(),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const url = new URL(req.url);
    const workspaceId = url.searchParams.get("workspaceId");

    if (!workspaceId) {
      return error("workspaceId is required", 400);
    }

    // Verify membership
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
    });

    if (!membership) {
      return error("Access denied", 403);
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return json({ members }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = inviteSchema.parse(body);

    const invite = await inviteWorkspaceMember(
      data.workspaceId,
      data.email.toLowerCase(),
      data.role,
      user.id
    );

    return json({ invite }, 201);
  } catch (e) {
    return handleError(e);
  }
}
