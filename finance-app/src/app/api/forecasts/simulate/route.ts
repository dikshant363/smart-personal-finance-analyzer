import { requireAuthed, json, handleError } from "@/lib/api";
import { runSimulation } from "@/lib/forecasting/engine";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json().catch(() => ({}));

    if (!body.adjustments || !body.period) {
      return json({ error: "adjustments and period are required" }, 400);
    }

    const result = await runSimulation({
      userId: user.id,
      adjustments: body.adjustments,
      period: body.period,
    });

    return json({ simulation: result }, 201);
  } catch (e) {
    return handleError(e);
  }
}
