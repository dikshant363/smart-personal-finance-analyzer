"use client";

import * as React from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { InsightCard } from "@/components/ai-insights/insight-card";
import { type AiInsight } from "@/lib/ai-insights";
import { cn } from "@/lib/utils";

export function AiInsightsFeed({ userId }: { userId: string }) {
  const [insights, setInsights] = React.useState<AiInsight[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchInsights = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai-insights?refresh=true`);
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to load insights");
      }
      const payload = (await res.json()) as { insights: AiInsight[] };
      setInsights(payload.insights ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  async function handleFeedback(id: string, feedback: "helpful" | "not_helpful") {
    await fetch(`/api/ai-insights/${encodeURIComponent(id)}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback }),
    });
    setInsights((prev) =>
      prev.map((insight) =>
        insight.id === id ? { ...insight, feedback } : insight
      )
    );
  }

  async function handleDismiss(id: string) {
    await fetch(`/api/ai-insights/${encodeURIComponent(id)}/feedback`, {
      method: "DELETE",
    });
    setInsights((prev) => prev.map((insight) => (insight.id === id ? { ...insight, dismissed: true } : insight)));
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <Sparkles className="h-4 w-4" />
            <span>AI-powered insights</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInsights}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : insights.length === 0 ? (
          <EmptyState
            title="No insights yet"
            description="Insights will appear once enough data is analyzed."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onFeedback={handleFeedback}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
