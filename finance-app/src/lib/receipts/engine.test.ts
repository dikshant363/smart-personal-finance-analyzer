import { describe, it, expect, vi, beforeEach } from "vitest";
import { getReceiptProcessor } from "./index";
import { createProcessedDocument, updateProcessedDocument, getProcessedDocument } from "./repository";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    processedDocument: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("Document Intelligence Pipeline (DIP) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts parameters and confidence levels via local provider", async () => {
    const processor = getReceiptProcessor();
    expect(processor.name).toBe("local");

    const input = {
      buffer: Buffer.from("mock text"),
      fileName: "starbucks_latte.png",
      mimeType: "image/png",
    };

    const result = await processor.process(input);

    expect(result.merchant).toBe("Starbucks Coffee");
    expect(result.total).toBe(7.8);
    expect(result.merchantConfidence).toBe(0.99);
    expect(result.totalConfidence).toBe(0.98);
  });

  it("extracts custom total from filename format", async () => {
    const processor = getReceiptProcessor();
    const input = {
      buffer: Buffer.from("mock"),
      fileName: "receipt_85.20.png",
      mimeType: "image/png",
    };

    const result = await processor.process(input);
    expect(result.total).toBe(85.2);
    expect(result.tax).toBeCloseTo(8.52, 1);
  });

  it("manages document status updates in repository", async () => {
    const mockDoc = {
      id: "doc1",
      userId: "u1",
      fileName: "invoice.pdf",
      fileType: "PDF",
      fileSize: 1024,
      status: "processing",
    };

    (prisma.processedDocument.create as any).mockResolvedValueOnce(mockDoc);

    const created = await createProcessedDocument("u1", {
      fileName: "invoice.pdf",
      fileType: "PDF",
      fileSize: 1024,
    });

    expect(created.id).toBe("doc1");
    expect(created.status).toBe("processing");
  });
});
