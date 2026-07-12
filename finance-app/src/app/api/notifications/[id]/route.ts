import { json, error, handleError, requireAuthed } from "@/lib/api";
import { markNotificationAsRead, deleteNotification } from "@/lib/automation";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const updated = await markNotificationAsRead(user.id, params.id);
    if (!updated) return error("Notification not found", 404);

    return json({ notification: updated }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const ok = await deleteNotification(user.id, params.id);
    if (!ok) return error("Notification not found", 404);

    return json({ ok: true }, 200);
  } catch (e) {
    return handleError(e);
  }
}
