import { json, handleError, requireAuthed } from "@/lib/api";
import { PerformanceManager } from "@/lib/performance/engine";
import { z } from "zod";

const metricSchema = z.object({
  key: z.string(),
  durationMs: z.number(),
});

export async function GET(req: Request) {
  try {
    await requireAuthed();
    const summary = PerformanceManager.getMetricsSummary();
    return json({ metrics: summary }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAuthed();
    const body = await req.json();
    const data = metricSchema.parse(body);

    PerformanceManager.logMetric(data.key, data.durationMs);

    return json({ logged: true }, 201);
  } catch (e) {
    return handleError(e);
  }
}
