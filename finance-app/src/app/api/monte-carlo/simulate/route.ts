import { json, handleError, requireAuthed } from "@/lib/api";
import { runMonteCarlo, runSensitivityAnalysis } from "@/lib/monte-carlo";
import { z } from "zod";

const monteCarloSchema = z.object({
  simulationsCount: z.number().min(10).max(1000),
  seed: z.number(),
  years: z.number().min(1).max(50),
  initialValue: z.number().min(0),
  annualContribution: z.number().min(0),
  expectedReturn: z.number(),
  expectedVolatility: z.number(),
  inflationRate: z.number(),
  goalTarget: z.number().min(1),
});

export async function POST(req: Request) {
  try {
    await requireAuthed();
    const body = await req.json();
    const parsed = monteCarloSchema.parse(body);

    const simulation = runMonteCarlo(parsed);
    const sensitivity = runSensitivityAnalysis(parsed);

    return json({ simulation, sensitivity }, 200);
  } catch (e) {
    return handleError(e);
  }
}
