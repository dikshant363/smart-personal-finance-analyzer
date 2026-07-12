import { json, error, handleError, requireAuthed } from "@/lib/api";
import { restoreApplicationBackup } from "@/lib/exchange";
import { z } from "zod";

const restoreSchema = z.object({
  backup: z.object({
    version: z.string(),
    timestamp: z.string(),
    profile: z.any().nullable().optional(),
    categories: z.array(z.any()),
    transactions: z.array(z.any()),
    budgets: z.array(z.any()),
    goals: z.array(z.any()),
    recurringItems: z.array(z.any()),
  }),
  options: z.object({
    restoreProfile: z.boolean().optional(),
    restoreCategories: z.boolean().optional(),
    restoreTransactions: z.boolean().optional(),
    restoreBudgets: z.boolean().optional(),
    restoreGoals: z.boolean().optional(),
    restoreRecurringItems: z.boolean().optional(),
  }),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const { backup, options } = restoreSchema.parse(body);

    const summary = await restoreApplicationBackup(user.id, backup as any, options);
    return json({ summary }, 201);
  } catch (e) {
    return handleError(e);
  }
}
