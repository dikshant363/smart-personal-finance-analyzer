import { json, handleError, requireAuthed } from "@/lib/api";
import { submitMessageFeedback } from "@/lib/agent";
import { z } from "zod";

const feedbackSchema = z.object({
  messageId: z.string().min(1),
  feedback: z.enum(["Like", "Dislike"]),
});

export async function POST(req: Request) {
  try {
    await requireAuthed();
    const body = await req.json();
    const { messageId, feedback } = feedbackSchema.parse(body);

    const updated = await submitMessageFeedback(messageId, feedback);
    return json({ message: updated }, 200);
  } catch (e) {
    return handleError(e);
  }
}
