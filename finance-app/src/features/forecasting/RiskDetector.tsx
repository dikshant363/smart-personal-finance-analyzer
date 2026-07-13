"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const severityVariant: Record<string, "warning" | "danger" | "info"> = {
  high: "danger",
  medium: "warning",
  low: "info",
};

export function RiskDetector({ userId }: { userId: string }) {
  const [risks, setRisks] = React.useState<
    Array<{ id: string; title: string; severity: string; detail: string; evidence?: string }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/forecasts/risks?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to load risks");
      }
      const payload = (await res.json()) as { risks: Array<{ id: string; title: string; severity: string; detail: string; evidence?: string }> };
      setRisks(payload.risks ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Detection</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-neutral-500">Loading risks…</p>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        ) : risks.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle className="h-6 w-6" />}
            title="No risks detected"
            description="Looks like your finances are on track."
          />
        ) : (
          <div className="space-y-3">
            {risks.map((risk) => (
              <div
                key={risk.id}
                className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {risk.title}
                  </h4>
                  <Badge variant={severityVariant[risk.severity] ?? "info"} className="capitalize">
                    {risk.severity}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{risk.detail}</p>
                {risk.evidence && (
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                    Evidence: {risk.evidence}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
