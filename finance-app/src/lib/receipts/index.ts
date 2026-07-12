import { ReceiptProcessor } from "./types";
import { NoneReceiptProcessor } from "./stub";

export function getReceiptProcessor(): ReceiptProcessor {
  const provider = process.env.RECEIPT_PROVIDER ?? "none";
  if (provider === "none") {
    return new NoneReceiptProcessor();
  }
  return new NoneReceiptProcessor();
}
