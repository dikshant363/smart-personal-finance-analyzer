import { json, handleError, requireAuthed } from "@/lib/api";
import { createBusinessClient } from "@/lib/business";
import { z } from "zod";

const clientSchema = z.object({
  businessId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    await requireAuthed();
    const body = await req.json();
    const { businessId, name, email, notes } = clientSchema.parse(body);

    const created = await createBusinessClient(businessId, name, email, notes);
    return json({ client: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
