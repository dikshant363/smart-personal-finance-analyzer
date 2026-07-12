import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeBudgetSpent } from "@/lib/budgets";
import { toNumber } from "@/lib/currency";
import { BudgetsClient } from "@/components/budgets/budgets-client";

export default async function BudgetsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [budgets, categories, profile] = await Promise.all([
    prisma.budget.findMany({
      where: { userId: user.id },
      include: { category: { select: { name: true, color: true } } },
    }),
    prisma.category.findMany({
      where: { userId: user.id, type: "Expense" },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const currency = profile?.currency ?? "USD";

  const items = await Promise.all(
    budgets.map(async (b) => {
      const spent = await computeBudgetSpent(user.id, b);
      const amount = toNumber(b.amount);
      return {
        id: b.id,
        name: b.name,
        amount,
        period: b.period,
        categoryId: b.categoryId,
        category: b.category,
        spent,
        remaining: amount - spent,
        percent: amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0,
      };
    })
  );

  return (
    <div className="space-y-4">
      <h1>Budgets</h1>
      <BudgetsClient budgets={items} categories={categories} currency={currency} />
    </div>
  );
}
