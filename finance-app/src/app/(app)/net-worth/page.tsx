import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNetWorthSummary, getAssetAllocation, projectNetWorth, getAssetAiExplanation } from "@/lib/asset";
import { NetWorthClient } from "@/components/asset/net-worth-client";

export default async function NetWorthPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [summary, allocation, projection, assets, profile] = await Promise.all([
    getNetWorthSummary(user.id),
    getAssetAllocation(user.id),
    projectNetWorth(user.id, 12),
    prisma.asset.findMany({
      where: { userId: user.id, status: "Active" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const aiExplanation = getAssetAiExplanation(summary, allocation);
  const currency = profile?.currency ?? "USD";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Net Worth & Asset Management</h1>
      <NetWorthClient
        initialSummary={summary}
        initialAllocation={allocation}
        initialProjection={projection}
        initialAssets={assets}
        currency={currency}
      />
    </div>
  );
}
