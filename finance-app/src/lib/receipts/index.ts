import { ReceiptProcessor } from "./types";
import { NoneReceiptProcessor } from "./stub";
import { LocalReceiptProcessor } from "./local-provider";

export function getReceiptProcessor(): ReceiptProcessor {
  const provider = process.env.RECEIPT_PROVIDER ?? "local";
  if (provider === "local" || provider === "mock") {
    return new LocalReceiptProcessor();
  }
  return new NoneReceiptProcessor();
}
export { LocalReceiptProcessor } from "./local-provider";
export { NoneReceiptProcessor } from "./stub";
