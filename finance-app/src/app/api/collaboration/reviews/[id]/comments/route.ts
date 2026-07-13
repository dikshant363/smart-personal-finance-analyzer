import { json, handleError, requireAuthed } from "@/lib/api";
import { addReviewComment } from "@/lib/collaboration";
import { z } from "zod";

const commentInputSchema = z.object({
  content: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const { content } = commentInputSchema.parse(body);

    const comment = await addReviewComment(user.id, params.id, content);
    return json({ comment }, 201);
  } catch (e) {
    return handleError(e);
  }
}
