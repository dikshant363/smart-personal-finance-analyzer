import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";
import { withBaseCurrency } from "@/lib/currency";
import { TransactionsClient } from "@/components/transactions/transactions-client";

export default async function TransactionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const txs = await prisma.transaction.findMany({
    where: { userId: user.id, date: { gte: start, lt: end } },
    orderBy: { date: "desc" },
    take: 200,
    include: { category: { select: { name: true, color: true, id: true } } },
  });

  const mapped = txs.map((t) => ({
    id: t.id,
    type: t.type,
    amount: toNumber(t.amount),
    currency: t.currency,
    description: t.description,
    date: t.date.toISOString(),
    category: t.category ? { name: t.category.name, color: t.category.color } : null,
    categoryId: t.categoryId,
  }));

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const currency = profile?.currency ?? "USD";

  const transactionsView = await withBaseCurrency(mapped, currency);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <TransactionsClient transactions={transactionsView} categories={categories} currency={currency} />
    </div>
  );
}
