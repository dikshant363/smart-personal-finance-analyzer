import { requireAuthed, json, error, handleError } from "@/lib/api";
import { submitFeedback, dismissInsight } from "@/lib/ai-insights";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json().catch(() => ({}));
    const feedback = body.feedback;

    if (feedback !== "helpful" && feedback !== "not_helpful") {
      return error("Invalid feedback value", 400);
    }

    const insightId = body.insightId;
    if (!insightId) {
      return error("insightId is required", 400);
    }

    await submitFeedback(insightId, user.id, feedback);
    return json({ success: true });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuthed();
    await dismissInsight(params.id, user.id);
    return json({ success: true });
  } catch (e) {
    return handleError(e);
  }
}
