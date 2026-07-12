import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { CopilotEngine } from "@/lib/copilot";
import { z } from "zod";

const messageSchema = z.object({
  conversationId: z.string(),
  prompt: z.string(),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const url = new URL(req.url);
    const conversationId = url.searchParams.get("conversationId");

    if (!conversationId) {
      return error("conversationId query param is required", 400);
    }

    const existing = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!existing || existing.userId !== user.id) {
      return error("Access denied", 403);
    }

    const copilot = new CopilotEngine();
    const messages = await copilot.getConversationHistory(conversationId);

    return json({ messages }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = messageSchema.parse(body);

    const existing = await prisma.conversation.findUnique({
      where: { id: data.conversationId },
    });

    if (!existing || existing.userId !== user.id) {
      return error("Access denied", 403);
    }

    const copilot = new CopilotEngine();
    const messages = await copilot.submitMessage(
      data.conversationId,
      user.id,
      data.prompt
    );

    // Update conversation updatedAt timestamp to float thread to top
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    return json({ messages }, 200);
  } catch (e) {
    return handleError(e);
  }
}
