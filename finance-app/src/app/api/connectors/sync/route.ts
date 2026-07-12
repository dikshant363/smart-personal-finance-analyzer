import { json, handleError, requireAuthed } from "@/lib/api";
import { executeSync } from "@/lib/connector";
import { z } from "zod";

const syncSchema = z.object({
  provider: z.enum(["Mock", "CSV", "JSON"]),
  payload: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = syncSchema.parse(body);

    const result = await executeSync(user.id, data.provider, data.payload);

    return json({ result }, 200);
  } catch (e) {
    return handleError(e);
  }
}
