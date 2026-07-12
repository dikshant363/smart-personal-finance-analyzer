export interface ExtractedReceipt {
  merchant?: string;
  merchantConfidence?: number;
  total?: number;
  totalConfidence?: number;
  currency?: string;
  currencyConfidence?: number;
  date?: string;
  dateConfidence?: number;
  time?: string;
  timeConfidence?: number;
  subtotal?: number;
  subtotalConfidence?: number;
  tax?: number;
  taxConfidence?: number;
  discount?: number;
  discountConfidence?: number;
  paymentMethod?: string;
  paymentMethodConfidence?: number;
  receiptNumber?: string;
  receiptNumberConfidence?: number;
  items?: { name: string; amount: number }[];
  rawText?: string;
}

export interface ReceiptInput {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

export interface ReceiptProcessor {
  name: string;
  process(input: ReceiptInput): Promise<ExtractedReceipt>;
}
