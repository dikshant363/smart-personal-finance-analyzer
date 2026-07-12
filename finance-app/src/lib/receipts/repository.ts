import { prisma } from "@/lib/prisma";

export type Db = typeof prisma;

export async function createProcessedDocument(
  userId: string,
  data: { fileName: string; fileType: string; fileSize: number },
  db: Db = prisma
) {
  return db.processedDocument.create({
    data: {
      userId,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      status: "processing",
    },
  });
}

export async function updateProcessedDocument(
  userId: string,
  id: string,
  data: {
    status?: string;
    extractedData?: any;
    confidenceScore?: number;
  },
  db: Db = prisma
) {
  const existing = await db.processedDocument.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return null;

  return db.processedDocument.update({
    where: { id },
    data: {
      status: data.status,
      extractedData: data.extractedData !== undefined ? data.extractedData : undefined,
      confidenceScore: data.confidenceScore,
    },
  });
}

export async function getProcessedDocument(
  userId: string,
  id: string,
  db: Db = prisma
) {
  const doc = await db.processedDocument.findUnique({ where: { id } });
  if (!doc || doc.userId !== userId) return null;
  return doc;
}

export async function listProcessedDocuments(
  userId: string,
  status?: string,
  db: Db = prisma
) {
  return db.processedDocument.findMany({
    where: {
      userId,
      status: status ?? undefined,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteProcessedDocument(
  userId: string,
  id: string,
  db: Db = prisma
) {
  const existing = await db.processedDocument.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return false;

  await db.processedDocument.delete({ where: { id } });
  return true;
}
