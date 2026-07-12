import { requireAuthed, json, handleError } from "@/lib/api";
import { calculateHealthScore } from "@/lib/score/engine";
import { saveMonthlySnapshot } from "@/lib/score/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuthed();
    const result = await calculateHealthScore(user.id);
    await saveMonthlySnapshot(user.id, result);
    return json({ result });
  } catch (e) {
    return handleError(e);
  }
}
