import { json, error, handleError, requireAuthed } from "@/lib/api";
import { getProcessedDocument, updateProcessedDocument } from "@/lib/receipts/repository";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const doc = await getProcessedDocument(user.id, params.id);

    if (!doc) return error("Document not found", 404);
    if (doc.status !== "review_required") {
      return error("Document is not ready for confirmation or already confirmed", 400);
    }

    const data = doc.extractedData as any;
    if (!data || !data.merchant || !data.total) {
      return error("Extracted data is incomplete. Please correct fields before confirming.", 400);
    }

    // Read optional category mapping from request body
    const body = await req.json().catch(() => ({}));
    const categoryId = body.categoryId || null;
    const finalDescription = body.description || `Extracted from receipt: ${data.merchant}`;

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "Expense",
        amount: toNumber(data.total),
        currency: data.currency || "USD",
        categoryId,
        description: finalDescription,
        date: data.date ? new Date(data.date) : new Date(),
        source: "Receipt",
      },
    });

    // Update document status
    await updateProcessedDocument(user.id, params.id, {
      status: "confirmed",
    });

    return json({ transaction }, 201);
  } catch (e) {
    return handleError(e);
  }
}
