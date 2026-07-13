import { json, handleError, requireAuthed } from "@/lib/api";
import { settleExpense } from "@/lib/family";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuthed();
    const updated = await settleExpense(params.id);
    return json({ split: updated }, 200);
  } catch (e) {
    return handleError(e);
  }
}
