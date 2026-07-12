import { json, error, handleError, requireAuthed } from "@/lib/api";
import { getUpcomingPayments } from "@/lib/recurring";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const url = new URL(req.url);
    const startStr = url.searchParams.get("start");
    const endStr = url.searchParams.get("end");

    if (!startStr || !endStr) {
      return error("Missing start or end query parameters", 400);
    }

    const start = new Date(startStr);
    const end = new Date(endStr);

    const upcoming = await getUpcomingPayments(user.id, start, end);
    return json({ upcoming }, 200);
  } catch (e) {
    return handleError(e);
  }
}
