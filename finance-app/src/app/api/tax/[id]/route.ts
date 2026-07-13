import { json, error, handleError, requireAuthed } from "@/lib/api";
import { getTaxRecordById, updateTaxRecord, deleteTaxRecord } from "@/lib/tax";
import { z } from "zod";

const taxRecordUpdateSchema = z.object({
  taxYear: z.number().int().positive().optional(),
  jurisdiction: z.string().optional(),
  type: z.enum(["Income", "Expense", "Donation", "Investment"]).optional(),
  category: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().min(3).max(3).optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  documentId: z.string().nullable().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const rec = await getTaxRecordById(user.id, params.id);
    if (!rec) return error("Tax record not found", 404);

    return json({ record: rec }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const parsed = taxRecordUpdateSchema.parse(body);

    const updated = await updateTaxRecord(user.id, params.id, parsed);
    return json({ record: updated }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    await deleteTaxRecord(user.id, params.id);
    return json({ ok: true }, 200);
  } catch (e) {
    return handleError(e);
  }
}
