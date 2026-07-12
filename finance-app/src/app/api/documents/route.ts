import { json, handleError, requireAuthed } from "@/lib/api";
import { listProcessedDocuments } from "@/lib/receipts/repository";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? undefined;

    const documents = await listProcessedDocuments(user.id, status);
    return json({ documents }, 200);
  } catch (e) {
    return handleError(e);
  }
}
