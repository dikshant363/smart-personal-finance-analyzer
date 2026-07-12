import { type AiInsight } from "@/lib/ai-insights";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const typeVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  summary: "info",
  forecast: "info",
  recommendation: "success",
  health: "warning",
  trend: "info",
  achievement: "success",
  risk: "danger",
  education: "default",
  budget: "info",
  savings: "success",
};

export function InsightCard({
  insight,
  onFeedback,
  onDismiss,
}: {
  insight: AiInsight;
  onFeedback?: (id: string, feedback: "helpful" | "not_helpful") => void;
  onDismiss?: (id: string) => void;
}) {
  const hasFeedback = insight.feedback != null;
  const isDismissed = insight.dismissed;

  return (
    <Card className={cn("flex flex-col", isDismissed && "opacity-60")}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{insight.title}</CardTitle>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={typeVariant[insight.type] ?? "default"} className="capitalize">
              {insight.type}
            </Badge>
            <Badge variant={insight.confidence >= 0.8 ? "success" : insight.confidence >= 0.5 ? "warning" : "danger"}>
              {Math.round(insight.confidence * 100)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {insight.summary}
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{insight.detail}</p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Generated{" "}
          {insight.generatedAt
            ? new Date(insight.generatedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {!hasFeedback && !isDismissed && (
            <>
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                onClick={() => onFeedback?.(insight.id!, "helpful")}
              >
                Helpful
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                onClick={() => onFeedback?.(insight.id!, "not_helpful")}
              >
                Not Helpful
              </button>
            </>
          )}
          {hasFeedback && !isDismissed && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Feedback: {insight.feedback === "helpful" ? "Helpful" : "Not Helpful"}
            </span>
          )}
          {!isDismissed && (
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
              onClick={() => onDismiss?.(insight.id!)}
            >
              Dismiss
            </button>
          )}
          {isDismissed && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Dismissed</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
