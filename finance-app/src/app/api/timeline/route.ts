import { json, error, handleError, requireAuthed } from "@/lib/api";
import { getUnifiedTimeline, generatePlanningSuggestions } from "@/lib/timeline";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const url = new URL(req.url);
    const startStr = url.searchParams.get("start");
    const endStr = url.searchParams.get("end");

    const now = new Date();
    // Default to last 30 days and next 60 days if query params are missing
    const start = startStr ? new Date(startStr) : new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = endStr ? new Date(endStr) : new Date(now.getFullYear(), now.getMonth() + 2, 0);

    const events = await getUnifiedTimeline(user.id, start, end);
    const suggestions = generatePlanningSuggestions(events);

    return json({
      events,
      suggestions,
    });
  } catch (e) {
    return handleError(e);
  }
}
