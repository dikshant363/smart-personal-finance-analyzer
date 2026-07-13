import { json, handleError, requireAuthed } from "@/lib/api";
import { getReviewRequests, createReviewRequest } from "@/lib/collaboration";
import { z } from "zod";

const reviewRequestInputSchema = z.object({
  collaboratorId: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  module: z.enum(["Retirement", "Investments", "Tax", "Insurance"]),
});

export async function GET() {
  try {
    const user = await requireAuthed();
    const list = await getReviewRequests(user.id);
    return json({ reviews: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const parsed = reviewRequestInputSchema.parse(body);

    const created = await createReviewRequest(user.id, parsed);
    return json({ review: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
