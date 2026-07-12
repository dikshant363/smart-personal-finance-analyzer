import { completeText } from "@/lib/ai/complete";
import { formatMoney } from "@/lib/currency";
import type { RuleRecommendation } from "@/lib/recommendations/types";

export async function enhanceRecommendation(
  rec: RuleRecommendation,
  currency: string
): Promise<string> {
  const savings = formatMoney(rec.monthlySavings, currency);

  const prompt = [
    `Recommendation: ${rec.title}`,
    `Summary: ${rec.summary}`,
    `Reason: ${rec.reason}`,
    `Evidence: ${rec.evidence}`,
    `Estimated monthly savings: ${savings}`,
    `Suggested action: ${rec.action}`,
    ``,
    `Write a friendly 2-3 sentence explanation of WHY this matters for this person, plus one practical alternative.`,
    `Reference the provided data only. Do not invent numbers, transactions, or facts.`,
  ].join("\n");

  const result = await completeText(prompt);

  if (!result || result.length < 20) {
    return `${rec.summary} ${rec.reason}`;
  }

  return result;
}
