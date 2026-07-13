import { json, handleError, requireAuthed } from "@/lib/api";
import { confirmDocumentData } from "@/lib/ocr2";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuthed();
    const updated = await confirmDocumentData(params.id);
    return json({ document: updated }, 200);
  } catch (e) {
    return handleError(e);
  }
}
