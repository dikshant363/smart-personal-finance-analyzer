import { json, handleError, requireAuthed } from "@/lib/api";
import { getConversations, createConversationSession, orchestrateAgentInvocation } from "@/lib/agent";
import { z } from "zod";

const createSessionSchema = z.object({
  title: z.string().min(1),
});

const chatInvokeSchema = z.object({
  conversationId: z.string().min(1),
  agentId: z.string().min(1),
  message: z.string().min(1),
});

export async function GET() {
  try {
    const user = await requireAuthed();
    const list = await getConversations(user.id);
    return json({ sessions: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();

    // Check if initiating new conversation or sending message
    if (body.title) {
      const parsed = createSessionSchema.parse(body);
      const session = await createConversationSession(user.id, parsed.title);
      return json({ session }, 201);
    }

    const { conversationId, agentId, message } = chatInvokeSchema.parse(body);
    const reply = await orchestrateAgentInvocation(user.id, conversationId, agentId, message);

    return json({ reply }, 200);
  } catch (e) {
    return handleError(e);
  }
}
