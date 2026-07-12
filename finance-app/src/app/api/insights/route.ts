import { getAuthedUser } from "@/lib/api";
import { buildInsightContext } from "@/lib/ai";
import { generateInsights } from "@/lib/ai";
import { json, error, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const user = await getAuthedUser();
    if (!user) return error("Unauthorized", 401);

    const ctx = await buildInsightContext(user.id);
    const result = await generateInsights(ctx);

    return json({ result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("OPENAI_API_KEY") || message.includes("AI")) {
      return error("AI provider unavailable: " + message, 502);
    }
    return handleError(e);
  }
}
