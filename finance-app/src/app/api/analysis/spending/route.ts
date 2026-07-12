import { requireAuthed, json, handleError } from "@/lib/api";
import { analyzeSpending } from "@/lib/analysis/analyze";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuthed();
    const result = await analyzeSpending(user.id);
    return json({ result });
  } catch (e) {
    return handleError(e);
  }
}
