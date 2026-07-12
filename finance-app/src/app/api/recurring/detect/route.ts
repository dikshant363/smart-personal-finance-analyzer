import { json, error, handleError, requireAuthed } from "@/lib/api";
import { detectRecurringTransactions, createRecurringItem } from "@/lib/recurring";
import { z } from "zod";

const bulkConfirmSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      categoryId: z.string().nullable().optional(),
      type: z.enum(["Income", "Expense"]),
      frequency: z.enum(["Daily", "Weekly", "Biweekly", "Monthly", "Quarterly", "Semi-Annual", "Annual", "Custom"]),
      amount: z.number(),
      expectedNextDate: z.string(),
      confidence: z.number(),
    })
  ),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const detected = await detectRecurringTransactions(user.id);
    return json({ detected }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const { items } = bulkConfirmSchema.parse(body);

    const created = [];
    for (const item of items) {
      const createdItem = await createRecurringItem(user.id, {
        ...item,
        isDetected: true,
        status: "Active",
      });
      created.push(createdItem);
    }

    return json({ created, count: created.length }, 201);
  } catch (e) {
    return handleError(e);
  }
}
