import type { AiInsightInput } from "./types";
import { BASE_SYSTEM, TYPE_PROMPTS } from "./prompts";

export const PROMPT_VERSION = "2.0.0";

export function getPromptVersion(): string {
  return PROMPT_VERSION;
}

type PromptContext = AiInsightInput["context"];

export function buildPrompt(type: AiInsightInput["type"], context: PromptContext): { system: string; user: string } {
  let system = BASE_SYSTEM;
  system += TYPE_PROMPTS[type] || "";
  let user = "";

  switch (type) {
    case "summary":
      user = JSON.stringify({ healthScore: context.healthScore, analysis: context.analysis, recommendations: context.recommendations?.slice(0, 3) }, null, 2);
      break;
    case "forecast":
      user = JSON.stringify({ forecast: context.forecast, healthScore: context.healthScore }, null, 2);
      break;
    case "recommendation":
      user = JSON.stringify({ recommendations: context.recommendations?.slice(0, 3), healthScore: context.healthScore, analysis: context.analysis }, null, 2);
      break;
    case "health":
      user = JSON.stringify({ healthScore: context.healthScore, analysis: context.analysis?.insights?.slice(0, 3) }, null, 2);
      break;
    case "trend":
      user = JSON.stringify({ analysis: context.analysis }, null, 2);
      break;
    case "achievement":
      user = JSON.stringify({ healthScore: context.healthScore, analysis: context.analysis, recommendations: context.recommendations }, null, 2);
      break;
    case "risk":
      user = JSON.stringify({ analysis: context.analysis, forecast: context.forecast, healthScore: context.healthScore }, null, 2);
      break;
    case "education":
      user = JSON.stringify({ healthScore: context.healthScore, analysis: context.analysis?.insights?.slice(0, 2) }, null, 2);
      break;
    case "budget":
      user = JSON.stringify({ analysis: context.analysis, recommendations: context.recommendations?.filter(r => r.priority === "high" || r.priority === "critical") }, null, 2);
      break;
    case "savings":
      user = JSON.stringify({ recommendations: context.recommendations, forecast: context.forecast, healthScore: context.healthScore }, null, 2);
      break;
  }

  return { system, user };
}
