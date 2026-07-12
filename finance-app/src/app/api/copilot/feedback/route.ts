import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const feedbackSchema = z.object({
  messageId: z.string(),
  feedback: z.enum(["Like", "Dislike"]),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = feedbackSchema.parse(body);

    const message = await prisma.message.findUnique({
      where: { id: data.messageId },
      include: { conversation: true },
    });

    if (!message || message.conversation.userId !== user.id) {
      return error("Message not found", 404);
    }

    const updated = await prisma.message.update({
      where: { id: data.messageId },
      data: { feedback: data.feedback },
    });

    return json({ message: updated }, 200);
  } catch (e) {
    return handleError(e);
  }
}
