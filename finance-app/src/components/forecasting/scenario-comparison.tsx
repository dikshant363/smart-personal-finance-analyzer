"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";

const scenarioLabel: Record<string, string> = {
  expected: "Expected",
  best: "Best",
  worst: "Worst",
};

const scenarioVariant: Record<string, "default" | "success" | "danger" | "info"> = {
  expected: "info",
  best: "success",
  worst: "danger",
};

function ScenarioCard({
  scenario,
  summary,
  currency,
}: {
  scenario: string;
  summary?: { endValue: number; changePercent: number };
  currency: string;
}) {
  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{scenarioLabel[scenario] ?? scenario}</CardTitle>
          <Badge variant={scenarioVariant[scenario] ?? "default"}>
            {scenarioLabel[scenario] ?? scenario}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const changeColor =
    summary.changePercent > 0
      ? "text-green-600 dark:text-green-400"
      : summary.changePercent < 0
        ? "text-red-600 dark:text-red-400"
        : "text-neutral-600 dark:text-neutral-400";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{scenarioLabel[scenario] ?? scenario}</CardTitle>
        <Badge variant={scenarioVariant[scenario] ?? "default"}>
          {scenarioLabel[scenario] ?? scenario}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Projected End Value</p>
          <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {formatMoney(summary.endValue, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Change</p>
          <p className={cn("text-sm font-semibold", changeColor)}>
            {summary.changePercent.toFixed(1)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScenarioComparison({
  userId,
  period,
  type,
  currency = "USD",
}: {
  userId: string;
  period: string;
  type: string;
  currency?: string;
}) {
  const [data, setData] = React.useState<
    Record<string, { endValue: number; changePercent: number }>
  >({});
  const [loading, setLoading] = React.useState(true);
  const scenarios = ["best", "expected", "worst"] as const;

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const results = await Promise.all(
          scenarios.map(async (scenario) => {
            const res = await fetch(
              `/api/forecasts?userId=${encodeURIComponent(userId)}&period=${encodeURIComponent(period)}&type=${encodeURIComponent(type)}&scenario=${encodeURIComponent(scenario)}`
            );
            const json = await res.json();
            if (json?.forecast?.summary) {
              return [scenario, json.forecast.summary] as const;
            }
            return [scenario, null] as const;
          })
        );
        if (cancelled) return;
        const next: Record<string, { endValue: number; changePercent: number }> = {};
        for (const [scenario, summary] of results) {
          if (summary) next[scenario] = summary;
        }
        setData(next);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId, period, type]);

  const allEmpty = scenarios.every((s) => !data[s]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        Scenario Comparison
      </h3>
      {loading ? (
        <p className="text-sm text-neutral-500">Loading scenarios…</p>
      ) : allEmpty ? (
        <EmptyState
          title="No comparison data"
          description="Generate a forecast to compare best, expected, and worst outcomes."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {scenarios.map((s) => (
            <ScenarioCard
              key={s}
              scenario={s}
              summary={data[s]}
              currency={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
}
