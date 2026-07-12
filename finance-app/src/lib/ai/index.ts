import { AIProvider, InsightContext, InsightResult } from "./types";
import { OpenAIProvider } from "./openai";
export { buildInsightContext } from "./insights";

export class MockProvider implements AIProvider {
  name = "mock";

  async generateInsights(_ctx: InsightContext): Promise<InsightResult> {
    return {
      insights: [
        {
          id: "mock-1",
          title: "Demo Mode Active",
          detail: "Insights are placeholders because no AI provider is configured.",
          severity: "info",
        },
        {
          id: "mock-2",
          title: "Set OPENAI_API_KEY",
          detail: "Configure an API key to enable real AI-powered financial insights.",
          severity: "info",
        },
      ],
      confidence: 0,
      note: "Mock provider — set OPENAI_API_KEY for real insights",
      generatedAt: new Date().toISOString(),
    };
  }

  async generateSingleInsight(_system: string, _user: string): Promise<{ content: string; confidence: number }> {
    return {
      content: "Demo mode: configure an AI provider for real insights.",
      confidence: 0,
    };
  }
}

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? "openai";
  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    try {
      return new OpenAIProvider();
    } catch {
      return new MockProvider();
    }
  }
  return new MockProvider();
}

export async function generateInsights(ctx: InsightContext): Promise<InsightResult> {
  return getAIProvider().generateInsights(ctx);
}
