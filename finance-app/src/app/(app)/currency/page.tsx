import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrencyAllocationSummary } from "@/lib/currency/engine";
import { CurrencyClient } from "@/components/currency/CurrencyClient";

export default async function CurrencyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profile, rates] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.exchangeRate.findMany({
      orderBy: { date: "desc" },
      take: 15,
    }),
  ]);

  const baseCurrency = profile?.currency ?? "USD";
  const allocation = await getCurrencyAllocationSummary(user.id, baseCurrency);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Multi-Currency & FX Exchange Desk</h1>
      <CurrencyClient
        initialAllocation={allocation}
        initialRates={rates}
        baseCurrency={baseCurrency}
      />
    </div>
  );
}
