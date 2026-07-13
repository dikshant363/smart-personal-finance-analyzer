import { json, handleError, requireAuthed } from "@/lib/api";
import { getFeatureFlags, registerFeatureFlag } from "@/lib/experiment";
import { z } from "zod";

const registerFlagSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  rolloutPercent: z.number().min(0).max(100).optional(),
});

export async function GET() {
  try {
    await requireAuthed();
    const flags = await getFeatureFlags();
    return json({ flags }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAuthed();
    const body = await req.json();
    const { key, name, description, rolloutPercent } = registerFlagSchema.parse(body);

    const created = await registerFeatureFlag(key, name, description, rolloutPercent);
    return json({ flag: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
