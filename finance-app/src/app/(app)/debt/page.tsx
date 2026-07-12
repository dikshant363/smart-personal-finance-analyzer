import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDebtOverview, calculateDebtHealthScore, simulateRepaymentStrategy, getDebtAiExplanation } from "@/lib/debt";
import { DebtClient } from "@/components/debt/debt-client";

export default async function DebtPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [overview, healthScore, avalanche, snowball, equal, list, profile] = await Promise.all([
    getDebtOverview(user.id),
    calculateDebtHealthScore(user.id),
    simulateRepaymentStrategy(user.id, "Avalanche", 200),
    simulateRepaymentStrategy(user.id, "Snowball", 200),
    simulateRepaymentStrategy(user.id, "Equal", 200),
    prisma.liability.findMany({
      where: { userId: user.id, status: "Active" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const aiExplanation = getDebtAiExplanation(healthScore, overview.totalDebt);
  const currency = profile?.currency ?? "USD";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Debt & Liability Repayment Planner</h1>
      <DebtClient
        initialOverview={overview}
        initialHealthScore={healthScore}
        initialStrategies={{ avalanche, snowball, equal }}
        initialLiabilities={list}
        currency={currency}
      />
    </div>
  );
}
