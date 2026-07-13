import { AnalysisResult } from "@/lib/analysis/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { LineChart } from "./LineChart";

function priorityBadge(priority: string) {
  const variant = priority === "critical" ? "danger" : "default";
  return <Badge variant={variant}>{priority}</Badge>;
}

function confidenceBadge(confidence: string) {
  const variant =
    confidence === "very_high"
      ? "success"
      : confidence === "high"
        ? "success"
        : confidence === "medium"
          ? "warning"
          : "default";
  return <Badge variant={variant}>{confidence}</Badge>;
}

function severityBadge(severity: string) {
  const variant =
    severity === "critical"
      ? "danger"
      : severity === "high"
        ? "warning"
        : severity === "medium"
          ? "warning"
          : "default";
  return <Badge variant={variant}>{severity}</Badge>;
}

export function SpendingIntelligence({
  result,
  currency,
}: {
  result: AnalysisResult;
  currency: string;
}) {
  const topInsights = result.insights.slice(0, 5);

  return (
    <div className={cn("space-y-4")}>
      <Card>
        <CardHeader>
          <CardTitle>Top Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {topInsights.length === 0 ? (
            <EmptyState title="No insights yet" description="" />
          ) : (
            <div className="space-y-4">
              {topInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                >
                  <p className="font-medium">{insight.title}</p>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {insight.summary}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">{insight.evidence}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {priorityBadge(insight.priority)}
                    {confidenceBadge(insight.confidence)}
                  </div>
                  <p className="mt-2 text-sm italic text-neutral-600 dark:text-neutral-400">
                    {insight.suggestedAction}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {result.alerts.length === 0 ? (
            <p className="text-sm text-neutral-500">No alerts</p>
          ) : (
            <div className="space-y-3">
              {result.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{alert.title}</p>
                    {severityBadge(alert.severity)}
                  </div>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {alert.detail}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">{alert.evidence}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Monthly spending
            </p>
            <div className="h-36">
              <LineChart series={result.trends.monthly} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Income
              </p>
              <div className="h-28">
                <LineChart series={result.trends.incomeVsExpense.income} color="#16a34a" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Expenses
              </p>
              <div className="h-28">
                <LineChart series={result.trends.incomeVsExpense.expense} color="#dc2626" />
              </div>
            </div>
          </div>

          {result.trends.category.slice(0, 2).map((cat) => (
            <div key={cat.name}>
              <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                {cat.name}
              </p>
              <div className="h-28">
                <LineChart series={cat.series} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
