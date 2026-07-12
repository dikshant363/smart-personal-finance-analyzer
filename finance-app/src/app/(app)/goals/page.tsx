import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoalsClient } from "@/components/goals/goals-client";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [goals, profile] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const currency = profile?.currency ?? "USD";

  const items = goals.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    targetAmount: Number(g.targetAmount),
    currentAmount: Number(g.currentAmount),
    currency: g.currency,
    deadline: g.deadline ? g.deadline.toISOString() : null,
    priority: g.priority,
    status: g.status,
    progress:
      Number(g.targetAmount) > 0
        ? Math.min(100, Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100))
        : 0,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Financial Goals</h1>
      <GoalsClient goals={items} currency={currency} />
    </div>
  );
}
