import { json, handleError, requireAuthed } from "@/lib/api";
import { compileUserFinancialGraph } from "@/lib/graph";

export async function GET() {
  try {
    const user = await requireAuthed();
    const graph = await compileUserFinancialGraph(user.id);
    return json({ graph }, 200);
  } catch (e) {
    return handleError(e);
  }
}
