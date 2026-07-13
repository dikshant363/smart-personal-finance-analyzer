import { json, handleError, requireAuthed } from "@/lib/api";
import { getInvitations, inviteCollaborator, revokeInvitation } from "@/lib/collaboration";
import { z } from "zod";

const inviteInputSchema = z.object({
  email: z.string().email(),
  role: z.enum(["Financial Planner", "Accountant", "Lawyer", "Family Member", "Business Partner", "Mentor", "Custom"]),
  permissions: z.array(z.string()),
});

export async function GET() {
  try {
    const user = await requireAuthed();
    const list = await getInvitations(user.id);
    return json({ invitations: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const parsed = inviteInputSchema.parse(body);

    const created = await inviteCollaborator(user.id, parsed);
    return json({ invitation: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuthed();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "Missing invitation ID" }, 400);

    const updated = await revokeInvitation(user.id, id);
    return json({ invitation: updated }, 200);
  } catch (e) {
    return handleError(e);
  }
}
