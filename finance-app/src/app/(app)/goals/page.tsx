import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listGoals } from "@/lib/goals";
import { GoalsClient } from "@/components/goals/goals-client";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [goals, profile] = await Promise.all([
    listGoals(user.id),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const currency = profile?.currency ?? "USD";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Financial Goals</h1>
      <GoalsClient goals={goals} currency={currency} />
    </div>
  );
}
