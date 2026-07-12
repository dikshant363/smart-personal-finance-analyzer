import { requireAuthed, json, handleError } from "@/lib/api";
import { listRecommendations, regenerateRecommendations } from "@/lib/recommendations/repository";
import type { RecFilters, RecSort } from "@/lib/recommendations/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const { searchParams } = new URL(req.url);
    const filters: RecFilters = {};
    if (searchParams.get("priority")) filters.priority = searchParams.get("priority") as RecFilters["priority"];
    if (searchParams.get("category")) filters.category = searchParams.get("category") as RecFilters["category"];
    if (searchParams.get("difficulty")) filters.difficulty = searchParams.get("difficulty") as RecFilters["difficulty"];
    if (searchParams.get("status")) filters.status = searchParams.get("status") as RecFilters["status"];
    const min = searchParams.get("minSavings");
    if (min) filters.minSavings = Number(min);
    const sort = (searchParams.get("sort") as RecSort) || "priority";
    const recommendations = await listRecommendations(user.id, filters, sort);
    return json({ recommendations });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json().catch(() => ({}));
    if (body.action === "generate") {
      const recommendations = await regenerateRecommendations(user.id);
      return json({ recommendations }, 201);
    }
    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return handleError(e);
  }
}
