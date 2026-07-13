import { json, handleError, requireAuthed } from "@/lib/api";
import { syncBankConnectionData } from "@/lib/banking";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuthed();
    const syncedCount = await syncBankConnectionData(params.id);
    return json({ ok: true, syncedTransactions: syncedCount }, 200);
  } catch (e) {
    return handleError(e);
  }
}
