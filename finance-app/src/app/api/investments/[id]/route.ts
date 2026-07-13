import { json, error, handleError, requireAuthed } from "@/lib/api";
import { getInvestmentById, updateInvestment, deleteInvestment, calculateInvestmentPerformance } from "@/lib/investment";
import { z } from "zod";

const investmentUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  assetClass: z.string().optional(),
  ticker: z.string().optional(),
  accountId: z.string().nullable().optional(),
  portfolioId: z.string().nullable().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().positive().optional(),
  quantity: z.number().positive().optional(),
  currentValue: z.number().nonnegative().optional(),
  currency: z.string().min(3).max(3).optional(),
  fees: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const inv = await getInvestmentById(user.id, params.id);
    if (!inv) return error("Investment not found", 404);

    const performance = calculateInvestmentPerformance(inv);
    return json({ investment: inv, performance }, 200);
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
    const parsed = investmentUpdateSchema.parse(body);

    const updated = await updateInvestment(user.id, params.id, parsed);
    if (!updated) return error("Investment not found or unauthorized", 404);

    return json({ investment: updated }, 200);
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
    const ok = await deleteInvestment(user.id, params.id);
    if (!ok) return error("Investment not found or unauthorized", 404);

    return json({ ok: true }, 200);
  } catch (e) {
    return handleError(e);
  }
}
