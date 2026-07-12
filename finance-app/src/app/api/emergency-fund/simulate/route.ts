import { json, error, handleError, requireAuthed } from "@/lib/api";
import { calculateEmergencyMetrics, getEmergencyFundSettings, simulateScenario } from "@/lib/emergency-fund";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const simulationSchema = z.object({
  scenario: z.enum(["job_loss", "medical_emergency", "unexpected_repair", "income_reduction", "large_expense", "income_pause"]),
  paramValue: z.number().nonnegative().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = simulationSchema.parse(body);

    const [settings, metrics] = await Promise.all([
      getEmergencyFundSettings(user.id),
      calculateEmergencyMetrics(user.id),
    ]);

    // Average monthly income calculation
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const transactions = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId: user.id,
        date: { gte: start, lte: now },
      },
      _sum: { amount: true },
    });
    const totalIncome = Number(transactions.find((t) => t.type === "Income")?._sum.amount || 0);
    const averageMonthlyIncome = totalIncome / 6;

    const result = simulateScenario(data.scenario, {
      currentReserve: metrics.currentEmergencyFund,
      essentialExpenses: metrics.monthlyEssentialExpenses,
      monthlyContribution: metrics.monthlyContribution,
      averageMonthlyIncome,
      paramValue: data.paramValue,
    });

    return json({ result }, 200);
  } catch (e) {
    return handleError(e);
  }
}
