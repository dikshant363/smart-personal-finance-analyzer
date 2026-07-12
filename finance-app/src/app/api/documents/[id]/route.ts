import { json, error, handleError, requireAuthed } from "@/lib/api";
import { getProcessedDocument, updateProcessedDocument, deleteProcessedDocument } from "@/lib/receipts/repository";
import { z } from "zod";

const documentUpdateSchema = z.object({
  status: z.string().optional(),
  extractedData: z.any().optional(),
  confidenceScore: z.number().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = documentUpdateSchema.parse(body);

    const doc = await getProcessedDocument(user.id, params.id);
    if (!doc) return error("Not found", 404);

    const updated = await updateProcessedDocument(user.id, params.id, data);
    return json({ document: updated }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const ok = await deleteProcessedDocument(user.id, params.id);
    if (!ok) return error("Not found", 404);

    return json({ ok: true }, 200);
  } catch (e) {
    return handleError(e);
  }
}
