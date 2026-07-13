import { json, handleError, requireAuthed } from "@/lib/api";
import { buildExplanation } from "@/lib/explainability";
import { z } from "zod";

const traceSchema = z.object({
  targetType: z.enum(["Score", "RiskAlert", "Forecast", "DigitalTwin"]),
  payload: z.any(),
});

export async function POST(req: Request) {
  try {
    await requireAuthed();
    const body = await req.json();
    const { targetType, payload } = traceSchema.parse(body);

    const trace = buildExplanation(targetType, payload);
    return json({ trace }, 200);
  } catch (e) {
    return handleError(e);
  }
}
