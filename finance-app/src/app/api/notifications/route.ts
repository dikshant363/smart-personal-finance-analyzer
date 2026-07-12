import { json, handleError, requireAuthed } from "@/lib/api";
import { getNotifications } from "@/lib/automation";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const url = new URL(req.url);
    const unreadOnly = url.searchParams.get("unread") === "true";

    const list = await getNotifications(user.id, unreadOnly ? false : undefined);
    return json({ notifications: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}
