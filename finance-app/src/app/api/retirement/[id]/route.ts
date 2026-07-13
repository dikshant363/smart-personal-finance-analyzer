import { json, error, handleError, requireAuthed } from "@/lib/api";
import {
  getRetirementPlanById,
  updateRetirementPlan,
  deleteRetirementPlan,
  calculateRetirementProjections,
  generateAIRetirementExplanation,
} from "@/lib/retirement";
import { z } from "zod";

const retirementUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  profileType: z.enum(["Early", "Traditional", "Semi", "Custom"]).optional(),
  currentAge: z.number().int().positive().optional(),
  retirementAge: z.number().int().positive().optional(),
  lifeExpectancy: z.number().int().positive().optional(),
  currentSavings: z.number().nonnegative().optional(),
  monthlyContribution: z.number().nonnegative().optional(),
  expectedExpenses: z.number().positive().optional(),
  expectedReturn: z.number().nonnegative().optional(),
  expectedInflation: z.number().nonnegative().optional(),
  withdrawalStrategy: z.string().optional(),
  currency: z.string().min(3).max(3).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const plan = await getRetirementPlanById(user.id, params.id);
    if (!plan) return error("Retirement plan not found", 404);

    const calculations = calculateRetirementProjections(plan);
    const aiExplanation = generateAIRetirementExplanation(calculations.metrics, plan);

    return json(
      {
        plan,
        trajectory: calculations.trajectory,
        metrics: calculations.metrics,
        aiExplanation,
      },
      200
    );
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
    const parsed = retirementUpdateSchema.parse(body);

    const updated = await updateRetirementPlan(user.id, params.id, parsed);
    return json({ plan: updated }, 200);
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
    await deleteRetirementPlan(user.id, params.id);
    return json({ ok: true }, 200);
  } catch (e) {
    return handleError(e);
  }
}
