import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toNumber, getLatestRateMap } from "@/lib/currency";
import { listGoals } from "@/lib/goals";
import { GoalsClient } from "@/components/goals/GoalsClient";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [goals, profile] = await Promise.all([
    listGoals(user.id),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const currency = profile?.currency ?? "USD";

  const rateMap = await getLatestRateMap(
    currency,
    goals.map((g) => g.currency)
  );
  let totalTargetBase = 0;
  let totalSavedBase = 0;
  for (const g of goals) {
    const rate = rateMap.get(g.currency) ?? null;
    const mult = rate ?? 1;
    totalTargetBase += toNumber(g.targetAmount) * mult;
    totalSavedBase += toNumber(g.currentAmount) * mult;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Financial Goals</h1>
      <GoalsClient goals={goals} currency={currency} totals={{ target: totalTargetBase, saved: totalSavedBase }} />
    </div>
  );
}
