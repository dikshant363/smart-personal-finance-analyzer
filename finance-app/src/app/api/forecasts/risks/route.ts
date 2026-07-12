import { requireAuthed, json, handleError } from "@/lib/api";
import { detectRisks } from "@/lib/forecasting/engine";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const risks = await detectRisks(user.id);
    return json({ risks });
  } catch (e) {
    return handleError(e);
  }
}
