import { json, handleError, requireAuthed } from "@/lib/api";
import { evaluatePredictiveRisks } from "@/lib/risk-intelligence";

export async function GET() {
  try {
    const user = await requireAuthed();
    const scorecard = await evaluatePredictiveRisks(user.id);
    return json({ scorecard }, 200);
  } catch (e) {
    return handleError(e);
  }
}
