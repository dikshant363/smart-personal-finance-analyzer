import { json, handleError, requireAuthed } from "@/lib/api";
import { getNetWorthSummary, getAssetAllocation, projectNetWorth, getAssetAiExplanation } from "@/lib/asset";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    const summary = await getNetWorthSummary(user.id);
    const allocation = await getAssetAllocation(user.id);
    const projection = await projectNetWorth(user.id, 12);
    const aiExplanation = getAssetAiExplanation(summary, allocation);

    return json({
      summary,
      allocation,
      projection,
      aiExplanation,
    }, 200);
  } catch (e) {
    return handleError(e);
  }
}
