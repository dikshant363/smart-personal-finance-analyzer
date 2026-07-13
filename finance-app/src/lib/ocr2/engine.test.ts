import { describe, it, expect } from "vitest";
import { parseFinancialDocumentText } from "./engine";

describe("Document Intelligent OCR 2.0 Platform Tests", () => {
  it("extracts transaction values and targets Chase bank references", () => {
    const rawText = "Payment to Chase Bank ref #TRX-998811 for $420.50";
    const info = parseFinancialDocumentText(rawText, "Receipt");

    expect(info.institution).toBe("Chase Bank");
    expect(info.amount).toBe(420.50);
    expect(info.referenceNumber).toBe("TRX-998811");
    expect(info.confidence).toBeGreaterThanOrEqual(0.8);
  });
});
