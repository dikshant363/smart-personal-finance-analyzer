import { json, handleError, requireAuthed } from "@/lib/api";
import { linkEntitiesToDocument } from "@/lib/ocr2";
import { z } from "zod";

const linkSchema = z.object({
  transactionIds: z.array(z.string()).optional(),
  accountIds: z.array(z.string()).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuthed();
    const body = await req.json();
    const { transactionIds, accountIds } = linkSchema.parse(body);

    const updated = await linkEntitiesToDocument(params.id, { transactionIds, accountIds });
    return json({ document: updated }, 200);
  } catch (e) {
    return handleError(e);
  }
}
