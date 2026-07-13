import { json, handleError, requireAuthed } from "@/lib/api";
import { processDocumentUpload } from "@/lib/ocr2";
import { z } from "zod";

const uploadSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive(),
  rawText: z.string(),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const { fileName, fileType, fileSize, rawText } = uploadSchema.parse(body);

    const created = await processDocumentUpload(user.id, fileName, fileType, fileSize, rawText);
    return json({ document: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
