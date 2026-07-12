import { json, error, handleError, requireAuthed } from "@/lib/api";
import { updateRecurringItem, deleteRecurringItem } from "@/lib/recurring";
import { z } from "zod";

const recurringUpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  categoryId: z.string().nullable().optional(),
  type: z.enum(["Income", "Expense"]).optional(),
  frequency: z.enum(["Daily", "Weekly", "Biweekly", "Monthly", "Quarterly", "Semi-Annual", "Annual", "Custom"]).optional(),
  amount: z.number().positive().optional(),
  expectedNextDate: z.string().optional(),
  lastPaidDate: z.string().nullable().optional(),
  status: z.enum(["Active", "Paused", "Completed", "Cancelled", "Overdue"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = recurringUpdateSchema.parse(body);

    const updated = await updateRecurringItem(user.id, params.id, data);
    if (!updated) return error("Not found", 404);

    return json({ item: updated }, 200);
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
    const ok = await deleteRecurringItem(user.id, params.id);
    if (!ok) return error("Not found", 404);

    return json({ ok: true }, 200);
  } catch (e) {
    return handleError(e);
  }
}
