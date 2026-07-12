import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RecommendationsClient } from "@/components/recommendations/recommendations-client";

export default async function RecommendationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Financial Recommendations</h1>
      <RecommendationsClient />
    </div>
  );
}
