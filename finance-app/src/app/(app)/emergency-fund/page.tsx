import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateEmergencyMetrics,
  getEmergencyFundSettings,
  getEmergencyFundHistory,
  getEssentialExpensesBreakdown,
  generateEmergencyRecommendations,
  generateEmergencyForecast
} from "@/lib/emergency-fund";
import { EmergencyClient } from "@/features/emergency-fund/EmergencyClient";

export default async function EmergencyFundPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [settings, metrics, history, breakdown, profile] = await Promise.all([
    getEmergencyFundSettings(user.id),
    calculateEmergencyMetrics(user.id),
    getEmergencyFundHistory(user.id),
    getEssentialExpensesBreakdown(user.id),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const currency = profile?.currency ?? "USD";

  const recommendations = generateEmergencyRecommendations(metrics, currency);
  const forecast = generateEmergencyForecast({
    currentReserve: metrics.currentEmergencyFund,
    essentialExpenses: metrics.monthlyEssentialExpenses,
    monthlyContribution: metrics.monthlyContribution,
    targetMonths: settings.targetMonths,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Emergency Fund & Resilience</h1>
      <EmergencyClient
        initialSettings={settings}
        initialMetrics={metrics}
        history={history}
        breakdown={breakdown}
        recommendations={recommendations}
        forecast={forecast}
        currency={currency}
      />
    </div>
  );
}
