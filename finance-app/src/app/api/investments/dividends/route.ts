import { json, handleError, requireAuthed } from "@/lib/api";
import { getDividends, recordDividend } from "@/lib/investment";
import { z } from "zod";

const dividendInputSchema = z.object({
  investmentId: z.string().min(1),
  dividendDate: z.string(),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3),
  taxWithheld: z.number().nonnegative().optional(),
  reinvestmentStatus: z.enum(["Payout", "Reinvested"]).optional(),
});

export async function GET() {
  try {
    const user = await requireAuthed();
    const list = await getDividends(user.id);
    return json({ dividends: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const parsed = dividendInputSchema.parse(body);

    const created = await recordDividend(user.id, parsed);
    return json({ dividend: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
