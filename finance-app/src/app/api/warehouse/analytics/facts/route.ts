import { json, handleError, requireAuthed } from "@/lib/api";
import { extractDailySnapshot } from "@/lib/warehouse";

export async function GET() {
  try {
    const user = await requireAuthed();
    const facts = await extractDailySnapshot(user.id);
    return json({ facts }, 200);
  } catch (e) {
    return handleError(e);
  }
}
