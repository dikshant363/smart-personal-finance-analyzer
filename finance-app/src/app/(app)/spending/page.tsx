import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { analyzeSpending } from "@/lib/analysis/analyze";
import { SpendingIntelligence } from "@/components/analysis/spending-intelligence";

export default async function SpendingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const result = await analyzeSpending(user.id);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Spending Intelligence</h1>
      <SpendingIntelligence result={result} currency="USD" />
    </div>
  );
}
