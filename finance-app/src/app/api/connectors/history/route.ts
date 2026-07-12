import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    const list = await prisma.syncHistory.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    return json({ history: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}
