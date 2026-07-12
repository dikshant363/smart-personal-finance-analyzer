import { json, error, handleError, requireAuthed } from "@/lib/api";
import {
  listRecurringItems,
  createRecurringItem,
  getRecurringAnalytics,
  generateRecurringOptimizations,
  getRecurringForecast,
  detectRecurringTransactions
} from "@/lib/recurring";
import { z } from "zod";

const recurringSchema = z.object({
  name: z.string().min(1).max(80),
  categoryId: z.string().nullable().optional(),
  type: z.enum(["Income", "Expense"]),
  frequency: z.enum(["Daily", "Weekly", "Biweekly", "Monthly", "Quarterly", "Semi-Annual", "Annual", "Custom"]),
  amount: z.number().positive(),
  expectedNextDate: z.string(),
  lastPaidDate: z.string().nullable().optional(),
  status: z.enum(["Active", "Paused", "Completed", "Cancelled", "Overdue"]).optional(),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const items = await listRecurringItems(user.id);
    const analytics = await getRecurringAnalytics(user.id);
    const optimizations = await generateRecurringOptimizations(user.id);
    const forecast = await getRecurringForecast(user.id);
    const detected = await detectRecurringTransactions(user.id);

    return json({
      items,
      analytics,
      optimizations,
      forecast,
      detected,
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = recurringSchema.parse(body);

    const item = await createRecurringItem(user.id, data);
    return json({ item }, 201);
  } catch (e) {
    return handleError(e);
  }
}
