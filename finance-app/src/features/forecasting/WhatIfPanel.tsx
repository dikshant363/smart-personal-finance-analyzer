"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

const PERIODS = ["7d", "30d", "90d", "6m", "1y"] as const;
const SCENARIOS = ["expected", "best", "worst"] as const;
const TYPES = ["cashflow", "savings", "expense", "income", "budget", "emergency_fund", "net_balance"] as const;

export function WhatIfPanel({
  userId,
  currency = "USD",
}: {
  userId: string;
  currency?: string;
}) {
  const [incomeChange, setIncomeChange] = React.useState("");
  const [expenseChange, setExpenseChange] = React.useState("");
  const [savingsIncrease, setSavingsIncrease] = React.useState("");
  const [period, setPeriod] = React.useState("90d");
  const [result, setResult] = React.useState<{ baseline: { summary: { endValue: number; changePercent: number } }; simulated: { summary: { endValue: number; changePercent: number } }; comparison: { cashflowDelta: number; savingsDelta: number; scoreDelta: number } } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/forecasts/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          adjustments: {
            incomeChange: incomeChange ? Number.parseFloat(incomeChange) : undefined,
            expenseChange: expenseChange ? Number.parseFloat(expenseChange) : undefined,
            savingsIncrease: savingsIncrease ? Number.parseFloat(savingsIncrease) : undefined,
          },
          period,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Simulation failed");
      }
      const payload = await res.json();
      setResult(payload);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>What-If Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={run} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="wi-period">Period</Label>
              <Select id="wi-period" value={period} onChange={(e) => setPeriod(e.target.value)}>
                {PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="wi-income">Income change ($)</Label>
              <Input
                id="wi-income"
                type="number"
                placeholder="e.g. 500"
                value={incomeChange}
                onChange={(e) => setIncomeChange(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="wi-expense">Expense change ($)</Label>
              <Input
                id="wi-expense"
                type="number"
                placeholder="e.g. 200"
                value={expenseChange}
                onChange={(e) => setExpenseChange(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="wi-savings">Savings increase ($)</Label>
              <Input
                id="wi-savings"
                type="number"
                placeholder="e.g. 100"
                value={savingsIncrease}
                onChange={(e) => setSavingsIncrease(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Run Simulation
          </Button>
        </form>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                  Baseline
                </p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatMoney(result.baseline.summary.endValue, currency)}
                </p>
                <p className="text-sm text-neutral-500">
                  {result.baseline.summary.changePercent.toFixed(1)}% change
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                  Simulated
                </p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatMoney(result.simulated.summary.endValue, currency)}
                </p>
                <p className="text-sm text-neutral-500">
                  {result.simulated.summary.changePercent.toFixed(1)}% change
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Cashflow delta</p>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    result.comparison.cashflowDelta > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {formatMoney(result.comparison.cashflowDelta, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Savings delta</p>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    result.comparison.savingsDelta > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {formatMoney(result.comparison.savingsDelta, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Score delta</p>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    result.comparison.scoreDelta > 0
                      ? "text-green-600 dark:text-green-400"
                      : result.comparison.scoreDelta < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-neutral-600 dark:text-neutral-400"
                  )}
                >
                  {result.comparison.scoreDelta > 0 ? "+" : ""}
                  {result.comparison.scoreDelta} pts
                </p>
              </div>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <EmptyState
            title="No simulation yet"
            description="Adjust the inputs and run a simulation to see projected changes."
          />
        )}
      </CardContent>
    </Card>
  );
}
