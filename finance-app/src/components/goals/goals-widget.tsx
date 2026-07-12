"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Target } from "lucide-react";

export default function GoalsWidget({ currency }: { currency: string }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [goals, setGoals] = React.useState<
    { id: string; name: string; progress: number; targetAmount: number }[]
  >([]);

  React.useEffect(() => {
    let mounted = true;

    fetch("/api/goals?status=active")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load goals");
        }
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setGoals((data.goals ?? []).slice(0, 3));
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
        Loading goals…
      </p>
    );
  }

  if (error || goals.length === 0) {
    return (
      <EmptyState
        icon={<Target className="h-6 w-6" />}
        title="No active goals"
        description="Create goals to track your progress toward them."
      />
    );
  }

  return (
    <div className="space-y-3">
      {goals.map((g) => (
        <div key={g.id} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {g.name}
            </span>
            <span className="text-neutral-500">{g.progress}%</span>
          </div>
          <div className="mt-1">
            <Progress value={g.progress} />
          </div>
        </div>
      ))}
    </div>
  );
}
