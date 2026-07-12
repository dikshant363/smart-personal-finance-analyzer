import { requireAuthed, json, handleError } from "@/lib/api";
import { getScoreTrend } from "@/lib/score/engine";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const { searchParams } = new URL(req.url);
    const range = (searchParams.get("range") as "weekly" | "monthly" | "yearly") || "monthly";
    const trend = await getScoreTrend(user.id, range);
    return json({ trend });
  } catch (e) {
    return handleError(e);
  }
}
