import { StoredRecommendation } from "@/lib/recommendations/types";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export function RecommendationsSummary({
  recs,
  currency,
}: {
  recs: StoredRecommendation[];
  currency: string;
}) {
  if (recs.length === 0) {
    return <EmptyState title="No recommendations yet" />;
  }

  const top = recs[0];
  const highPriority = recs.filter(
    (r) => r.priority === "critical" || r.priority === "high"
  ).length;
  const monthlySavings = recs.reduce((sum, r) => sum + r.monthlySavings, 0);
  const annualSavings = recs.reduce((sum, r) => sum + r.annualSavings, 0);
  const expectedScore = Math.min(
    100,
    recs.reduce((sum, r) => sum + r.scoreImpact, 0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Top Recommendation
          </p>
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
            {top.title}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {top.summary}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              High Priority
            </p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {highPriority}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Potential Monthly Savings
            </p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {formatMoney(monthlySavings, currency)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Potential Yearly Savings
            </p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {formatMoney(annualSavings, currency)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Expected Score Improvement
            </p>
            <p
              className={cn(
                "text-2xl font-semibold text-brand-600 dark:text-brand-400"
              )}
            >
              +{expectedScore} pts
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
