import { json, error, handleError, requireAuthed } from "@/lib/api";
import { goalUpdateSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { updateGoal, deleteGoal } from "@/lib/goals";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const data = goalUpdateSchema.parse(await req.json());
    const updated = await updateGoal(user.id, params.id, data);
    if (!updated) return error("Not found", 404);
    return json({ goal: updated });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const ok = await deleteGoal(user.id, params.id);
    if (!ok) return error("Not found", 404);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
