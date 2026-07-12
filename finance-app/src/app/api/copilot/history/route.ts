import { json, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    let list = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    if (list.length === 0) {
      await prisma.conversation.create({
        data: {
          userId: user.id,
          title: "Initial Advisory Chat",
        },
      });

      list = await prisma.conversation.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      });
    }

    return json({ conversations: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = createSchema.parse(body);

    const conv = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: data.title ?? "New Advisory Conversation",
      },
    });

    return json({ conversation: conv }, 201);
  } catch (e) {
    return handleError(e);
  }
}
