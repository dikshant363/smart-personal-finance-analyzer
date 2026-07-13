import { json, handleError, requireAuthed } from "@/lib/api";
import { getRetirementPlans, createRetirementPlan } from "@/lib/retirement";
import { z } from "zod";

const retirementInputSchema = z.object({
  name: z.string().min(1).max(100),
  profileType: z.enum(["Early", "Traditional", "Semi", "Custom"]),
  currentAge: z.number().int().positive(),
  retirementAge: z.number().int().positive(),
  lifeExpectancy: z.number().int().positive(),
  currentSavings: z.number().nonnegative(),
  monthlyContribution: z.number().nonnegative(),
  expectedExpenses: z.number().positive(),
  expectedReturn: z.number().nonnegative(),
  expectedInflation: z.number().nonnegative(),
  withdrawalStrategy: z.string().min(1),
  currency: z.string().min(3).max(3),
  workspaceId: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireAuthed();
    const plans = await getRetirementPlans(user.id);
    return json({ plans }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const parsed = retirementInputSchema.parse(body);

    const created = await createRetirementPlan(user.id, parsed);
    return json({ plan: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
