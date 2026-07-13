import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AiInsightsFeed } from "@/components/ai-insights/AiInsightsFeed";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AiInsightsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } });
  const aiInsightsEnabled = settings?.aiInsightsEnabled ?? true;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">AI Insights</h1>
      {aiInsightsEnabled ? (
        <AiInsightsFeed userId={user.id} />
      ) : (
        <Card>
          <CardContent>
            <EmptyState title="AI Insights disabled" description="Enable AI insights in Settings to view personalized financial insights." />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
