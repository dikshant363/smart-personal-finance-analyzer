import { json, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const history = await prisma.workflowHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return json({ history }, 200);
  } catch (e) {
    return handleError(e);
  }
}
