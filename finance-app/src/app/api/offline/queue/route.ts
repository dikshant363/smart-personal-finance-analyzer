import { json, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { queueOfflineAction } from "@/lib/offline/engine";
import { z } from "zod";

const pushSchema = z.object({
  action: z.string(),
  payload: z.any(),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    const list = await prisma.offlineSyncQueue.findMany({
      where: { userId: user.id, status: "Pending" },
      orderBy: { createdAt: "asc" },
    });

    return json({ queue: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = pushSchema.parse(body);

    const queued = await queueOfflineAction(
      user.id,
      data.action,
      data.payload
    );

    return json({ queued }, 201);
  } catch (e) {
    return handleError(e);
  }
}
