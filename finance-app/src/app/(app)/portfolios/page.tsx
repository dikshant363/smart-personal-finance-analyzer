import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPortfoliosSummary } from "@/lib/portfolio";
import { PortfolioClient } from "@/components/portfolio/PortfolioClient";

export default async function PortfoliosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [portfolios, accounts, profile] = await Promise.all([
    getPortfoliosSummary(user.id),
    prisma.account.findMany({
      where: { userId: user.id, status: "Active" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const allPortfoliosRaw = await prisma.portfolio.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  const currency = profile?.currency ?? "USD";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Account Portfolios & Balances</h1>
      <PortfolioClient
        initialPortfoliosSummary={portfolios}
        initialAccounts={accounts}
        allPortfoliosRaw={allPortfoliosRaw}
        currency={currency}
      />
    </div>
  );
}
