import { json, handleError, requireAuthed } from "@/lib/api";
import { processOfflineSyncQueue } from "@/lib/offline/engine";

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();

    const stats = await processOfflineSyncQueue(user.id);

    return json({ stats }, 200);
  } catch (e) {
    return handleError(e);
  }
}
