import { ReceiptProcessor } from "./types";

export class NoneReceiptProcessor implements ReceiptProcessor {
  name = "none";

  async process(): Promise<never> {
    throw new Error("OCR not configured: set RECEIPT_PROVIDER to enable receipt scanning");
  }
}
