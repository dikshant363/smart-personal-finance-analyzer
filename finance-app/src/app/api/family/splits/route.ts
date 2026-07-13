import { json, handleError, requireAuthed } from "@/lib/api";
import { recordSharedExpense } from "@/lib/family";
import { z } from "zod";

const recordSplitSchema = z.object({
  householdId: z.string().min(1),
  transactionId: z.string().min(1),
  splitType: z.enum(["Equal", "Percentage", "Custom"]),
  shares: z.array(
    z.object({
      userId: z.string().min(1),
      amount: z.number(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    await requireAuthed();
    const body = await req.json();
    const { householdId, transactionId, splitType, shares } = recordSplitSchema.parse(body);

    const created = await recordSharedExpense(householdId, transactionId, splitType, shares);
    return json({ split: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
