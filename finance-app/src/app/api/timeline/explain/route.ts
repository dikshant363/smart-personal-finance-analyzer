import { json, error, handleError, requireAuthed } from "@/lib/api";
import { getAiEventExplanation } from "@/lib/timeline";
import { z } from "zod";

const explainSchema = z.object({
  id: z.string(),
  type: z.any(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  timestamp: z.string(),
  status: z.any(),
  module: z.string(),
  amount: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    await requireAuthed();
    const body = await req.json();
    const data = explainSchema.parse(body);

    const explanation = getAiEventExplanation({
      ...data,
      timestamp: new Date(data.timestamp),
    } as any);

    return json({ explanation }, 200);
  } catch (e) {
    return handleError(e);
  }
}
