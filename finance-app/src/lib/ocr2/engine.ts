import { prisma } from "@/lib/prisma";

export interface ExtractedInfo {
  institution?: string;
  amount?: number;
  date?: string;
  referenceNumber?: string;
  documentType: string;
  confidence: number;
}

export function parseFinancialDocumentText(text: string, documentType: string): ExtractedInfo {
  let confidence = 0.5;
  const lower = text.toLowerCase();

  // Simple keyword-based extraction mock logic
  let institution = "Unknown Institution";
  if (lower.includes("chase")) {
    institution = "Chase Bank";
    confidence += 0.15;
  } else if (lower.includes("fidelity")) {
    institution = "Fidelity Investments";
    confidence += 0.15;
  }

  let amount = 0;
  const amountMatch = text.match(/\$\s*(\d+(?:\.\d{2})?)/);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1]);
    confidence += 0.15;
  }

  let referenceNumber = "N/A";
  const refMatch = text.match(/(?:ref|id|invoice|policy|account)\s*#?\s*([A-Z0-9-]{4,12})/i);
  if (refMatch) {
    referenceNumber = refMatch[1];
    confidence += 0.15;
  }

  return {
    institution,
    amount,
    date: new Date().toISOString().split("T")[0],
    referenceNumber,
    documentType,
    confidence: Math.min(confidence, 1.0),
  };
}

export async function processDocumentUpload(
  userId: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  rawText: string,
  db = prisma
) {
  const extracted = parseFinancialDocumentText(rawText, "Invoice");

  return db.processedDocument.create({
    data: {
      userId,
      fileName,
      fileType,
      fileSize,
      status: "review_required",
      extractedData: {
        extracted: extracted as any,
        rawText,
        linkedEntities: {
          transactionIds: [],
          accountIds: [],
        },
      } as any,
      confidenceScore: extracted.confidence,
    },
  });
}

export async function linkEntitiesToDocument(
  documentId: string,
  links: { transactionIds?: string[]; accountIds?: string[] },
  db = prisma
) {
  const doc = await db.processedDocument.findUnique({
    where: { id: documentId },
  });

  if (!doc) throw new Error("Document not found.");

  const currentData = (doc.extractedData as any) || {};
  const currentLinks = currentData.linkedEntities || { transactionIds: [], accountIds: [] };

  const updatedLinks = {
    transactionIds: Array.from(new Set([...(currentLinks.transactionIds || []), ...(links.transactionIds || [])])),
    accountIds: Array.from(new Set([...(currentLinks.accountIds || []), ...(links.accountIds || [])])),
  };

  return db.processedDocument.update({
    where: { id: documentId },
    data: {
      extractedData: {
        ...currentData,
        linkedEntities: updatedLinks,
      },
    },
  });
}

export async function confirmDocumentData(documentId: string, db = prisma) {
  return db.processedDocument.update({
    where: { id: documentId },
    data: { status: "confirmed" },
  });
}
