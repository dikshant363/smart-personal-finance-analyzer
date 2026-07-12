import type { ForecastResult } from "@/lib/forecasting";
import { formatMoney } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const scenarioLabel: Record<string, string> = {
  expected: "Expected",
  best: "Best",
  worst: "Worst",
};

const typeLabel: Record<string, string> = {
  cashflow: "Cashflow",
  savings: "Savings",
  expense: "Expenses",
  income: "Income",
  budget: "Budget",
  category: "Category",
  emergency_fund: "Emergency Fund",
  health_score: "Health Score",
  goal: "Goal",
  net_balance: "Net Balance",
};

export function ForecastCard({
  forecast,
  currency = "USD",
  className,
}: {
  forecast: ForecastResult;
  currency?: string;
  className?: string;
}) {
  const changeColor =
    forecast.summary.change > 0
      ? "text-green-600 dark:text-green-400"
      : forecast.summary.change < 0
        ? "text-red-600 dark:text-red-400"
        : "text-neutral-600 dark:text-neutral-400";

  const confidenceColor =
    forecast.confidence >= 0.8
      ? "success"
      : forecast.confidence >= 0.5
        ? "warning"
        : "danger";

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">
            {typeLabel[forecast.type] ?? forecast.type}
          </CardTitle>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="info" className="capitalize">
              {scenarioLabel[forecast.scenario] ?? forecast.scenario}
            </Badge>
            <Badge variant={confidenceColor}>
              {Math.round(forecast.confidence * 100)}% confidence
            </Badge>
          </div>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
          {forecast.period}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Start</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {formatMoney(forecast.summary.startValue, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">End</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {formatMoney(forecast.summary.endValue, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Change</p>
            <p className={cn("text-sm font-semibold", changeColor)}>
              {formatMoney(forecast.summary.change, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Change %</p>
            <p className={cn("text-sm font-semibold", changeColor)}>
              {forecast.summary.changePercent.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
