import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecommendationsClient } from "@/components/recommendations/RecommendationsClient";

export default async function RecommendationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const currency = profile?.currency ?? "USD";
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Financial Recommendations</h1>
      <RecommendationsClient currency={currency} />
    </div>
  );
}
