import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { respondToInvitation } from "@/lib/workspace/engine";
import { z } from "zod";

const responseSchema = z.object({
  invitationId: z.string(),
  response: z.enum(["Accept", "Decline"]),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    const invitations = await prisma.workspaceInvitation.findMany({
      where: {
        email: user.email.toLowerCase(),
        status: "Pending",
      },
      include: {
        workspace: { select: { name: true, type: true } },
        invitedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return json({ invitations }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = responseSchema.parse(body);

    const invite = await respondToInvitation(
      data.invitationId,
      user.id,
      user.email,
      data.response
    );

    return json({ invite }, 200);
  } catch (e) {
    return handleError(e);
  }
}
