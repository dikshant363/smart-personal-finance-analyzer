import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { ScoreBand } from "@/lib/score/types";
import { CircularProgress } from "@/components/score/CircularProgress";

export function HealthScoreCard({
  score,
  band,
  trendDelta,
  lastUpdated,
  currency,
}: {
  score: number;
  band: ScoreBand;
  trendDelta: number | null;
  lastUpdated: string;
  currency?: string;
}) {
  const variant =
    band === "Excellent" || band === "Very Good"
      ? "success"
      : band === "Good"
        ? "default"
        : band === "Needs Improvement" || band === "Poor"
          ? "warning"
          : "danger";

  const trend =
    trendDelta == null ? (
      <span className="text-neutral-500">—</span>
    ) : trendDelta > 0 ? (
      <span className="text-green-600">▲ +{trendDelta} this month</span>
    ) : (
      <span className="text-red-600">▼ {trendDelta} this month</span>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Health Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CircularProgress value={score} sublabel={band} />
          <div className="space-y-2 text-center sm:text-left">
            <Badge variant={variant}>{band}</Badge>
            <div className="text-sm">{trend}</div>
            <div className="text-xs text-neutral-500">
              Updated {new Date(lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
