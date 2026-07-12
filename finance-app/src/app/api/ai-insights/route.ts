import { requireAuthed, json, error, handleError } from "@/lib/api";
import { generateAiInsights, getAiInsightFeed } from "@/lib/ai-insights";
import { prisma } from "@/lib/prisma";
import type { InsightType } from "@/lib/ai-insights";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } });
    if (settings?.aiInsightsEnabled === false) {
      return json({ insights: [] });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as InsightType | null;
    const refresh = searchParams.get("refresh") === "true";

    if (refresh) {
      const types: InsightType[] = type ? [type] : ["summary", "forecast", "recommendation", "health", "trend", "achievement", "risk", "education", "budget", "savings"];
      const insights = await generateAiInsights(user.id, types);
      return json({ insights });
    }

    const insights = await getAiInsightFeed(user.id);
    if (type) {
      return json({ insights: insights.filter((i) => i.type === type) });
    }
    return json({ insights });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();

    const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } });
    if (settings?.aiInsightsEnabled === false) {
      return json({ insights: [] }, 201);
    }

    const body = await req.json().catch(() => ({}));
    const types: InsightType[] = Array.isArray(body.types) && body.types.length > 0 ? body.types : ["summary", "forecast", "recommendation", "health"];
    const insights = await generateAiInsights(user.id, types);
    return json({ insights }, 201);
  } catch (e) {
    return handleError(e);
  }
}
