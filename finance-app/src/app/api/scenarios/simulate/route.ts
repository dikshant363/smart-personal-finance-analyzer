import { json, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { compareScenarios, getScenarioAiExplanation } from "@/lib/scenario";
import { toNumber } from "@/lib/currency";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    const list = await prisma.financialScenario.findMany({
      where: { userId: user.id },
    });

    const inputs = list.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      estimatedCost: toNumber(s.estimatedCost),
      expectedIncomeImpact: toNumber(s.expectedIncomeImpact),
      expectedExpenseImpact: toNumber(s.expectedExpenseImpact),
      durationMonths: s.durationMonths,
      startDate: s.startDate,
    }));

    const results = await compareScenarios(user.id, inputs);

    const comparisons = results.map((res) => {
      const expl = getScenarioAiExplanation(res);
      return {
        ...res,
        aiExplanation: expl,
      };
    });

    return json({ comparisons }, 200);
  } catch (e) {
    return handleError(e);
  }
}
