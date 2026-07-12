import { json, error, handleError, requireAuthed } from "@/lib/api";
import {
  calculateEmergencyMetrics,
  getEmergencyFundSettings,
  updateEmergencyFundSettings,
  getEmergencyFundHistory,
  getEssentialExpensesBreakdown,
  generateEmergencyRecommendations,
  generateEmergencyForecast,
  saveEmergencyFundHistory
} from "@/lib/emergency-fund";
import { z } from "zod";

const settingsUpdateSchema = z.object({
  targetMonths: z.number().int().min(1).max(36).optional(),
  customEssentialExpenses: z.number().nonnegative().nullable().optional(),
  customReserve: z.number().nonnegative().nullable().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    const [settings, metrics, history, breakdown] = await Promise.all([
      getEmergencyFundSettings(user.id),
      calculateEmergencyMetrics(user.id),
      getEmergencyFundHistory(user.id),
      getEssentialExpensesBreakdown(user.id),
    ]);

    const recommendations = generateEmergencyRecommendations(metrics);
    const forecast = generateEmergencyForecast({
      currentReserve: metrics.currentEmergencyFund,
      essentialExpenses: metrics.monthlyEssentialExpenses,
      monthlyContribution: metrics.monthlyContribution,
      targetMonths: settings.targetMonths,
    });

    return json({
      settings,
      metrics,
      history,
      breakdown,
      recommendations,
      forecast,
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = settingsUpdateSchema.parse(body);

    const settings = await updateEmergencyFundSettings(user.id, data);

    // Re-calculate metrics and update the history log for the current month
    const metrics = await calculateEmergencyMetrics(user.id);
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    await saveEmergencyFundHistory(user.id, {
      month: monthStr,
      coverageMonths: metrics.coverageDurationMonths,
      readinessScore: metrics.readinessScore,
      currentReserve: metrics.currentEmergencyFund,
      essentialExpenses: metrics.monthlyEssentialExpenses,
    });

    return json({ settings, metrics }, 200);
  } catch (e) {
    return handleError(e);
  }
}
