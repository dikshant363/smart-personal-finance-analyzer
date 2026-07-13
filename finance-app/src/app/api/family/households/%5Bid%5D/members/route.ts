import { json, handleError, requireAuthed } from "@/lib/api";
import { addHouseholdMember } from "@/lib/family";
import { z } from "zod";

const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["Adult", "Child", "Guest"]),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuthed();
    const body = await req.json();
    const { userId, role } = addMemberSchema.parse(body);

    const created = await addHouseholdMember(params.id, userId, role);
    return json({ member: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
