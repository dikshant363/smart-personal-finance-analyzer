export interface ExtractedReceipt {
  merchant?: string;
  total?: number;
  currency?: string;
  date?: string;
  items?: { name: string; amount: number }[];
  rawText?: string;
}
export interface ReceiptInput { buffer: Buffer; mimeType: string; }
export interface ReceiptProcessor {
  name: string;
  process(input: ReceiptInput): Promise<ExtractedReceipt>;
}
