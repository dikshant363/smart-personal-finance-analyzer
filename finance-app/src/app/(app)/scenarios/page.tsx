import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compareScenarios, getScenarioAiExplanation } from "@/lib/scenario";
import { ScenarioClient } from "@/components/scenarios/ScenarioClient";
import { toNumber } from "@/lib/currency";

export default async function ScenariosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch baseline scenarios
  let list = await prisma.financialScenario.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Seed default scenarios for UI first render if empty
  if (list.length === 0) {
    const now = new Date();
    await prisma.financialScenario.createMany({
      data: [
        {
          userId: user.id,
          name: "Immediate House Purchase (A)",
          type: "BuyHouse",
          description: "Simulating buying a starter home immediately using savings.",
          startDate: now,
          durationMonths: 24,
          priority: "high",
          estimatedCost: 15000,
          expectedIncomeImpact: 0,
          expectedExpenseImpact: 1200,
          status: "Planned",
        },
        {
          userId: user.id,
          name: "Delayed House Purchase (B)",
          type: "BuyHouse",
          description: "Wait 2 years, accumulate more surplus capital before buying.",
          startDate: new Date(now.getFullYear() + 2, now.getMonth(), 1),
          durationMonths: 24,
          priority: "high",
          estimatedCost: 8000,
          expectedIncomeImpact: 0,
          expectedExpenseImpact: 900,
          status: "Draft",
        },
        {
          userId: user.id,
          name: "Early Retirement Track",
          type: "Retirement",
          description: "Increase retirement contributions aggressively by $500 monthly.",
          startDate: now,
          durationMonths: 60,
          priority: "medium",
          estimatedCost: 0,
          expectedIncomeImpact: 0,
          expectedExpenseImpact: 500,
          status: "Active",
        },
      ],
    });

    list = await prisma.financialScenario.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  }

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

  const simulations = await compareScenarios(user.id, inputs);

  const comparisons = simulations.map((res) => {
    const expl = getScenarioAiExplanation(res);
    return {
      ...res,
      aiExplanation: expl,
    };
  });

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const currency = profile?.currency ?? "USD";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Life Scenario Simulator & Planning</h1>
      <ScenarioClient
        initialScenarios={list}
        initialComparisons={comparisons}
        currency={currency}
      />
    </div>
  );
}
