import { json, handleError, requireAuthed } from "@/lib/api";
import {
  getInvestments,
  calculatePortfolioMetrics,
  calculateAssetAllocation,
  calculatePortfolioAllocation,
  calculateCurrencyAllocation,
  generateAIInvestmentExplanation,
} from "@/lib/investment";

export async function GET() {
  try {
    const user = await requireAuthed();
    const list = await getInvestments(user.id, "Active");

    const metrics = calculatePortfolioMetrics(list);
    const assetAllocation = calculateAssetAllocation(list);
    const portfolioAllocation = calculatePortfolioAllocation(list);
    const currencyAllocation = calculateCurrencyAllocation(list);
    const aiExplanation = generateAIInvestmentExplanation(metrics, assetAllocation);

    return json(
      {
        metrics,
        allocations: {
          assetClass: assetAllocation,
          portfolio: portfolioAllocation,
          currency: currencyAllocation,
        },
        aiExplanation,
      },
      200
    );
  } catch (e) {
    return handleError(e);
  }
}
