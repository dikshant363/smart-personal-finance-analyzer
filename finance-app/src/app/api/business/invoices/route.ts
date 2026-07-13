import { json, handleError, requireAuthed } from "@/lib/api";
import { createBusinessInvoice } from "@/lib/business";
import { z } from "zod";

const invoiceSchema = z.object({
  businessId: z.string().min(1),
  clientId: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.string().transform((str) => new Date(str)),
});

export async function POST(req: Request) {
  try {
    await requireAuthed();
    const body = await req.json();
    const { businessId, clientId, amount, dueDate } = invoiceSchema.parse(body);

    const created = await createBusinessInvoice(businessId, clientId, amount, dueDate);
    return json({ invoice: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
