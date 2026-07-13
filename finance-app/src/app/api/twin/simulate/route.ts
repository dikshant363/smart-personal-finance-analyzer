import { json, handleError, requireAuthed } from "@/lib/api";
import { buildFinancialBaseline, simulateScenario } from "@/lib/twin";
import { z } from "zod";

const simulationRequestSchema = z.object({
  changes: z.object({
    monthlySavingsDelta: z.number().optional(),
    discretionarySpendDelta: z.number().optional(),
    salaryIncreasePercent: z.number().optional(),
    extraDebtPayment: z.number().optional(),
  }),
  assumptions: z.object({
    inflationRate: z.number(),
    investmentReturn: z.number(),
    salaryGrowth: z.number(),
  }),
  projectionYears: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const { changes, assumptions, projectionYears } = simulationRequestSchema.parse(body);

    const baseline = await buildFinancialBaseline(user.id);
    const result = simulateScenario(baseline, changes, assumptions, projectionYears || 10);

    return json({ baseline, simulation: result }, 200);
  } catch (e) {
    return handleError(e);
  }
}
