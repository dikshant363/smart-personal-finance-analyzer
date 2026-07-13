import { json, handleError, requireAuthed } from "@/lib/api";
import { acceptInvitation } from "@/lib/collaboration";
import { z } from "zod";

const acceptInputSchema = z.object({
  token: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const { token } = acceptInputSchema.parse(body);

    const share = await acceptInvitation(user.id, token);
    return json({ share }, 200);
  } catch (e) {
    return handleError(e);
  }
}
