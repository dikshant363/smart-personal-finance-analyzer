import { requireAuthed, json, handleError } from "@/lib/api";
import { setRecommendationStatus } from "@/lib/recommendations/repository";
import type { RecStatus } from "@/lib/recommendations/types";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuthed();
    const body = await req.json().catch(() => ({}));
    const status = body.status as RecStatus;
    const recommendation = await setRecommendationStatus(user.id, params.id, status);
    if (!recommendation) return json({ error: "Not found" }, 404);
    return json({ recommendation });
  } catch (e) {
    return handleError(e);
  }
}
