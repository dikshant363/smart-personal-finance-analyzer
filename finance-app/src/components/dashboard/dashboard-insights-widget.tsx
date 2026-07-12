"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  title: string;
  detail: string;
  severity: string;
}

interface InsightResult {
  insights: Insight[];
  note: string;
}

export default function DashboardInsightsWidget({
  currency,
}: {
  currency: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InsightResult | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/insights")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load insights");
        }
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setResult(data.result ?? null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Analyzing your finances…
      </p>
    );
  }

  if (error || !result || !result.insights.length) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Insights will appear here.
      </p>
    );
  }

  const isDemo =
    result.note && /mock|not configured|demo/i.test(result.note);

  return (
    <div className="space-y-3">
      {isDemo && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Demo insights — set OPENAI_API_KEY for real analysis.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {result.insights.slice(0, 3).map((insight) => (
          <Card key={insight.id}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {insight.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                {insight.detail}
              </p>
              <div className="mt-2">
                <Badge
                  variant={
                    insight.severity === "positive"
                      ? "success"
                      : insight.severity === "warning"
                        ? "warning"
                        : insight.severity === "critical"
                          ? "danger"
                          : "default"
                  }
                >
                  {insight.severity}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
