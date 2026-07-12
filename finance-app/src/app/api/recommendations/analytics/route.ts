import { requireAuthed, json, handleError } from "@/lib/api";
import { computeAnalytics } from "@/lib/recommendations/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuthed();
    const analytics = await computeAnalytics(user.id);
    return json({ analytics });
  } catch (e) {
    return handleError(e);
  }
}
