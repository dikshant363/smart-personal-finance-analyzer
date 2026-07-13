import { json, handleError, requireAuthed } from "@/lib/api";
import { disconnectBanking } from "@/lib/banking";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuthed();
    await disconnectBanking(params.id);
    return json({ ok: true }, 200);
  } catch (e) {
    return handleError(e);
  }
}
