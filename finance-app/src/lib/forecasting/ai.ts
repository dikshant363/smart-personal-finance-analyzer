import { completeText } from "@/lib/ai/complete";
import type { ForecastResult } from "./types";

export interface ForecastExplanation {
  title: string;
  summary: string;
  detail: string;
  assumptions: string[];
  limitations: string[];
  suggestedActions: string[];
  confidence: number;
}

export async function explainForecast(
  forecast: ForecastResult,
  userType?: string
): Promise<ForecastExplanation> {
  const prompt = [
    `Forecast type: ${forecast.type}`,
    `Scenario: ${forecast.scenario}`,
    `Period: ${forecast.period}`,
    `Start value: ${forecast.summary.startValue.toFixed(2)}`,
    `End value: ${forecast.summary.endValue.toFixed(2)}`,
    `Change: ${forecast.summary.change.toFixed(2)} (${forecast.summary.changePercent.toFixed(1)}%)`,
    `Confidence: ${(forecast.confidence * 100).toFixed(0)}%`,
    `Risks: ${forecast.risks.join("; ") || "None detected"}`,
    `User type: ${userType ?? "unknown"}`,
    ``,
    `Write a concise 2-3 sentence summary explaining what this forecast means.`,
    `Then list 3-5 assumptions made, 2-3 limitations, and 2-3 suggested actions.`,
    `Do not invent financial data. Reference only the provided values.`,
  ].join("\n");

  const text = await completeText(prompt);

  const assumptions = text.match(/assumptions?:([\s\S]+?)(?:limitations?|actions?|$)/i)?.[1]?.trim() ?? "";
  const limitations = text.match(/limitations?:([\s\S]+?)(?:actions?|$)/i)?.[1]?.trim() ?? "";
  const actions = text.match(/actions?:([\s\S]+?)$/i)?.[1]?.trim() ?? "";

  return {
    title: `${forecast.type.charAt(0).toUpperCase() + forecast.type.slice(1)} forecast (${forecast.scenario})`,
    summary: text.split("\n")[0] ?? "Forecast generated based on historical data.",
    detail: text,
    assumptions: assumptions ? assumptions.split("\n").filter(Boolean) : ["Based on historical transaction data."],
    limitations: limitations ? limitations.split("\n").filter(Boolean) : ["Future events may alter projections."],
    suggestedActions: actions ? actions.split("\n").filter(Boolean) : ["Review trends regularly.", "Adjust budgets as needed."],
    confidence: forecast.confidence,
  };
}
