import { json, error, handleError, requireAuthed } from "@/lib/api";
import { getReceiptProcessor } from "@/lib/receipts";
import { createProcessedDocument, updateProcessedDocument } from "@/lib/receipts/repository";

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return error("No file uploaded", 400);

    // 1. Security Validations
    // Size limit: 5MB
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return error("File size exceeds 5MB limit", 400);
    }

    // MIME type check
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedMimeTypes.includes(file.type)) {
      return error("Invalid file type. Only JPEG, PNG, WEBP, and PDF are supported.", 400);
    }

    // Sanitize filename & reject executable content
    const safeName = file.name.replace(/[^a-zA-Z0-9_\.-]/g, "");
    if (
      safeName.endsWith(".exe") ||
      safeName.endsWith(".sh") ||
      safeName.endsWith(".bat") ||
      safeName.endsWith(".js")
    ) {
      return error("Executable content is rejected", 400);
    }

    // 2. Initialize database document entry
    const doc = await createProcessedDocument(user.id, {
      fileName: safeName,
      fileType: file.type.split("/")[1].toUpperCase(),
      fileSize: file.size,
    });

    // 3. Perform OCR Structured Extraction
    const buffer = Buffer.from(await file.arrayBuffer());
    const processor = getReceiptProcessor();

    let extracted;
    try {
      extracted = await processor.process({
        buffer,
        fileName: safeName,
        mimeType: file.type,
      });
    } catch (ocrErr) {
      await updateProcessedDocument(user.id, doc.id, {
        status: "failed",
      });
      throw ocrErr;
    }

    // Calculate confidence score averages
    const confs = [
      extracted.merchantConfidence,
      extracted.totalConfidence,
      extracted.dateConfidence,
      extracted.subtotalConfidence,
      extracted.taxConfidence,
      extracted.discountConfidence,
    ].filter((v) => typeof v === "number") as number[];

    const avgConfidence = confs.length > 0 ? confs.reduce((sum, c) => sum + c, 0) / confs.length : 0.9;

    // 4. Update status to review_required and save extracted parameters
    const updatedDoc = await updateProcessedDocument(user.id, doc.id, {
      status: "review_required",
      extractedData: extracted,
      confidenceScore: avgConfidence,
    });

    return json({ document: updatedDoc }, 201);
  } catch (e) {
    return handleError(e);
  }
}
