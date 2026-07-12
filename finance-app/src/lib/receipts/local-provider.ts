import { ReceiptProcessor, ReceiptInput, ExtractedReceipt } from "./types";

export class LocalReceiptProcessor implements ReceiptProcessor {
  name = "local";

  async process(input: ReceiptInput): Promise<ExtractedReceipt> {
    const fileName = input.fileName.toLowerCase();
    
    // Default mock values
    let merchant = "Grocery Outlet";
    let merchantConfidence = 0.92;
    let total = 42.50;
    let totalConfidence = 0.98;
    let currency = "USD";
    let currencyConfidence = 0.95;
    let date = new Date().toISOString().slice(0, 10);
    let dateConfidence = 0.88;
    let subtotal = 39.00;
    let subtotalConfidence = 0.90;
    let tax = 3.50;
    let taxConfidence = 0.85;
    let discount = 0.00;
    let discountConfidence = 0.99;
    let paymentMethod = "Visa";
    let paymentMethodConfidence = 0.95;
    let receiptNumber = "TXN-90210";
    let receiptNumberConfidence = 0.80;
    const items = [
      { name: "Milk", amount: 4.50 },
      { name: "Organic Bread", amount: 5.50 },
      { name: "Produce Basket", amount: 29.00 },
    ];

    // Smart filename parsing for manual testing / demo (e.g. walmart_150_tax_10.png)
    if (fileName.includes("walmart")) {
      merchant = "Walmart Supercenter";
      merchantConfidence = 0.99;
    } else if (fileName.includes("starbucks")) {
      merchant = "Starbucks Coffee";
      merchantConfidence = 0.99;
      total = 7.80;
      subtotal = 7.20;
      tax = 0.60;
      items.length = 0;
      items.push({ name: "Caffe Latte", amount: 4.80 });
      items.push({ name: "Croissant", amount: 3.00 });
    } else if (fileName.includes("apple")) {
      merchant = "Apple Store";
      merchantConfidence = 0.99;
      total = 1299.00;
      subtotal = 1200.00;
      tax = 99.00;
      items.length = 0;
      items.push({ name: "MacBook Air", amount: 1299.00 });
    }

    // Parse custom total from filename (e.g. receipt_85.20.png)
    const totalMatch = fileName.match(/_(\d+(?:\.\d+)?)/);
    if (totalMatch) {
      total = parseFloat(totalMatch[1]);
      subtotal = Math.round(total * 0.9 * 100) / 100;
      tax = Math.round((total - subtotal) * 100) / 100;
    }

    return {
      merchant,
      merchantConfidence,
      total,
      totalConfidence,
      currency,
      currencyConfidence,
      date,
      dateConfidence,
      time: "14:32",
      timeConfidence: 0.85,
      subtotal,
      subtotalConfidence,
      tax,
      taxConfidence,
      discount,
      discountConfidence,
      paymentMethod,
      paymentMethodConfidence,
      receiptNumber,
      receiptNumberConfidence,
      items,
      rawText: `MERCHANT: ${merchant}\nDATE: ${date}\nTOTAL: ${total}\nTAX: ${tax}\nITEMS:\n${items.map(i => `- ${i.name}: ${i.amount}`).join("\n")}`,
    };
  }
}
