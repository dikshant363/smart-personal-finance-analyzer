import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExchangeClient } from "@/components/exchange/ExchangeClient";

export default async function ExchangePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [audits, categories, profile] = await Promise.all([
    prisma.exchangeAudit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.category.findMany({ where: { userId: user.id } }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const currency = profile?.currency ?? "USD";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Data Exchange & Backup Center</h1>
      <ExchangeClient
        initialAudits={audits}
        categories={categories}
        currency={currency}
      />
    </div>
  );
}
