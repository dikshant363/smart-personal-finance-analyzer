"use client";

import * as React from "react";
import type { ForecastResult, ForecastPeriod, ForecastScenario, ForecastType } from "@/lib/forecasting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ForecastCard } from "@/components/forecasting/forecast-card";
import { ForecastTimeline } from "@/components/forecasting/forecast-timeline";
import { ScenarioComparison } from "@/components/forecasting/scenario-comparison";
import { RiskDetector } from "@/components/forecasting/risk-detector";
import { WhatIfPanel } from "@/components/forecasting/what-if-panel";
import { cn } from "@/lib/utils";

const PERIODS: ForecastPeriod[] = ["7d", "30d", "90d", "6m", "1y"];
const SCENARIOS: ForecastScenario[] = ["expected", "best", "worst"];
const TYPES: ForecastType[] = ["cashflow", "savings", "expense", "income", "budget", "emergency_fund", "net_balance"];

export function ForecastsClient({
  userId,
  currency = "USD",
}: {
  userId: string;
  currency: string;
}) {
  const [period, setPeriod] = React.useState<string>("90d");
  const [scenario, setScenario] = React.useState<string>("expected");
  const [type, setType] = React.useState<string>("savings");
  const [forecast, setForecast] = React.useState<ForecastResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setForecast(null);
    try {
      const res = await fetch(
        `/api/forecasts?userId=${encodeURIComponent(userId)}&period=${encodeURIComponent(period)}&type=${encodeURIComponent(type)}&scenario=${encodeURIComponent(scenario)}`
      );
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to generate forecast");
      }
      const payload = (await res.json()) as { forecast: ForecastResult };
      setForecast(payload.forecast);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[10rem] flex-1">
              <Label htmlFor="f-period">Period</Label>
              <Select id="f-period" value={period} onChange={(e) => setPeriod(e.target.value)}>
                {PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-[10rem] flex-1">
              <Label htmlFor="f-type">Type</Label>
              <Select id="f-type" value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-[10rem] flex-1">
              <Label htmlFor="f-scenario">Scenario</Label>
              <Select id="f-scenario" value={scenario} onChange={(e) => setScenario(e.target.value)}>
                {SCENARIOS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={generate} disabled={loading}>
              Generate
            </Button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </CardContent>
      </Card>

      {forecast && (
        <div className="space-y-4">
          <ForecastCard forecast={forecast} currency={currency} />
          <Card>
            <CardHeader>
              <CardTitle>Forecast Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ForecastTimeline points={forecast.points} currency={currency} />
            </CardContent>
          </Card>
          <ScenarioComparison userId={userId} period={forecast.period} type={forecast.type} currency={currency} />
          <RiskDetector userId={userId} />
          <WhatIfPanel userId={userId} currency={currency} />
        </div>
      )}

      {!forecast && !loading && !error && (
        <EmptyState
          title="No forecast generated"
          description="Select a period, type, and scenario, then click Generate to see your forecast."
        />
      )}
    </div>
  );
}
