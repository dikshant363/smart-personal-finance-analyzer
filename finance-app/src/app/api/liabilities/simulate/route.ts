import { json, handleError, requireAuthed } from "@/lib/api";
import { getDebtOverview, calculateDebtHealthScore, simulateRepaymentStrategy, getDebtAiExplanation } from "@/lib/debt";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const url = new URL(req.url);
    const extraStr = url.searchParams.get("extra");
    const extraRepayment = extraStr ? parseFloat(extraStr) : 200;

    const overview = await getDebtOverview(user.id);
    const healthScore = await calculateDebtHealthScore(user.id);

    const [avalanche, snowball, equal] = await Promise.all([
      simulateRepaymentStrategy(user.id, "Avalanche", extraRepayment),
      simulateRepaymentStrategy(user.id, "Snowball", extraRepayment),
      simulateRepaymentStrategy(user.id, "Equal", extraRepayment),
    ]);

    const aiExplanation = getDebtAiExplanation(healthScore, overview.totalDebt);

    return json({
      overview,
      healthScore,
      strategies: {
        avalanche,
        snowball,
        equal,
      },
      aiExplanation,
    }, 200);
  } catch (e) {
    return handleError(e);
  }
}
