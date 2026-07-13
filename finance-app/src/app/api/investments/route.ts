import { json, error, handleError, requireAuthed } from "@/lib/api";
import { getInvestments, createInvestment } from "@/lib/investment";
import { z } from "zod";

const investmentInputSchema = z.object({
  name: z.string().min(1).max(100),
  assetClass: z.string().min(1),
  ticker: z.string().optional(),
  accountId: z.string().optional(),
  portfolioId: z.string().optional(),
  purchaseDate: z.string(),
  purchasePrice: z.number().positive(),
  quantity: z.number().positive(),
  currentValue: z.number().nonnegative(),
  currency: z.string().min(3).max(3),
  fees: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireAuthed();
    const list = await getInvestments(user.id);
    return json({ investments: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const parsed = investmentInputSchema.parse(body);

    const created = await createInvestment(user.id, parsed);
    return json({ investment: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
