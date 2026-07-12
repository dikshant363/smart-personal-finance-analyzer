import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ForecastsClient } from "@/components/forecasting/forecasts-client";

export default async function ForecastsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const currency = profile?.currency ?? "USD";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Financial Forecasting</h1>
      <ForecastsClient userId={user.id} currency={currency} />
    </div>
  );
}
