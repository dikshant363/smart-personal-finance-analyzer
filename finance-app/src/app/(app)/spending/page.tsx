import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeSpending } from "@/lib/analysis/analyze";
import { SpendingIntelligence } from "@/components/analysis/SpendingIntelligence";

export default async function SpendingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const currency = profile?.currency ?? "USD";
  const result = await analyzeSpending(user.id);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Spending Intelligence</h1>
      <SpendingIntelligence result={result} currency={currency} />
    </div>
  );
}
