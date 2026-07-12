import OpenAI from "openai";
import { AIProvider, InsightContext, InsightResult, Insight } from "./types";

export class OpenAIProvider implements AIProvider {
  name = "openai";
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }
    this.client = new OpenAI({ apiKey });
    this.model = process.env.AI_MODEL ?? "gpt-4o-mini";
  }

  async generateInsights(ctx: InsightContext): Promise<InsightResult> {
    const systemPrompt = `You are a personal-finance analyst. Return ONLY a JSON object with shape:
{
  "insights": [{ "id": string, "title": string, "detail": string, "severity": "info" | "positive" | "warning" | "critical", "relatedMetric"?: string }],
  "confidence": number,
  "note": string
}
Rules:
- Base every claim strictly on the provided context. Do NOT invent transactions, amounts, or categories.
- Keep each insight concise (1-2 sentences).
- Severity: "positive" for good financial behavior, "warning" for potential issues, "critical" for serious problems, "info" for neutral observations.
- Confidence should reflect how well the data supports the insight (0-1).
- Note should explain any caveats or limitations.
- Maximum 6 insights.`;

    const userMessage = JSON.stringify({
      currency: ctx.currency,
      month: ctx.monthLabel,
      totals: ctx.totals,
      recentTransactions: ctx.recentTransactions,
      budgets: ctx.budgets,
    }, null, 2);

    const response = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty response");
    }

    let parsed: { insights: Insight[]; confidence: number; note: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error(`Failed to parse OpenAI JSON response: ${content}`);
    }

    if (!Array.isArray(parsed.insights)) {
      throw new Error("OpenAI response missing insights array");
    }

    const insights = parsed.insights.slice(0, 6).map((insight, index) => ({
      id: insight.id ?? `insight-${index + 1}`,
      title: insight.title ?? "Untitled Insight",
      detail: insight.detail ?? "",
      severity: ["info", "positive", "warning", "critical"].includes(insight.severity)
        ? insight.severity
        : "info",
      relatedMetric: insight.relatedMetric,
    }));

    return {
      insights,
      confidence: typeof parsed.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
      note: parsed.note ?? "",
      generatedAt: new Date().toISOString(),
    };
  }

  async generateSingleInsight(system: string, user: string): Promise<{ content: string; confidence: number }> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty response");
    }

    let parsed: { content: string; confidence: number };
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error(`Failed to parse OpenAI JSON response: ${content}`);
    }

    return {
      content: typeof parsed.content === "string" ? parsed.content : "",
      confidence: typeof parsed.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
    };
  }
}
