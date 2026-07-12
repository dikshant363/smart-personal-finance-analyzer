"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type InsightSeverity = "info" | "positive" | "warning" | "critical";

interface Insight {
  id: string;
  title: string;
  detail: string;
  severity: InsightSeverity;
  relatedMetric?: string;
}

interface InsightResult {
  insights: Insight[];
  confidence: number;
  note: string;
  generatedAt: string;
}

const severityVariant: Record<InsightSeverity, "info" | "success" | "warning" | "danger"> = {
  info: "info",
  positive: "success",
  warning: "warning",
  critical: "danger",
};

export default function InsightsPanel() {
  const [result, setResult] = useState<InsightResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights");
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to load insights");
      }
      const payload = (await res.json()) as { result: InsightResult };
      setResult(payload.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const isMock = result?.note?.includes("Mock") || result?.note?.includes("not configured");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <Sparkles className="h-4 w-4" />
          <span>
            {result ? `Confidence: ${Math.round(result.confidence * 100)}%` : "AI-powered analysis"}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInsights} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {isMock && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
          Showing demo insights. Set OPENAI_API_KEY in .env for real AI-powered analysis.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
          <Button variant="ghost" size="sm" className="ml-2" onClick={fetchInsights}>
            Retry
          </Button>
        </div>
      )}

      {loading && !result && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      )}

      {!loading && result && result.insights.length === 0 && !error && (
        <EmptyState title="No insights yet" />
      )}

      <div className="space-y-3">
        {result?.insights.map((insight) => (
          <Card key={insight.id}>
            <CardContent className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                  {insight.title}
                </h4>
                <Badge variant={severityVariant[insight.severity]} className="capitalize">
                  {insight.severity}
                </Badge>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{insight.detail}</p>
              {insight.relatedMetric && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  {insight.relatedMetric}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {result?.note && !isMock && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500">{result.note}</p>
      )}
    </div>
  );
}
