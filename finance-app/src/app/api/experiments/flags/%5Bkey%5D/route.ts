import { json, handleError, requireAuthed } from "@/lib/api";
import { updateFlagState } from "@/lib/experiment";
import { z } from "zod";

const updateFlagSchema = z.object({
  enabled: z.boolean(),
  rolloutPercent: z.number().min(0).max(100).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { key: string } }
) {
  try {
    await requireAuthed();
    const body = await req.json();
    const { enabled, rolloutPercent } = updateFlagSchema.parse(body);

    const updated = await updateFlagState(params.key, enabled, rolloutPercent);
    return json({ flag: updated }, 200);
  } catch (e) {
    return handleError(e);
  }
}
