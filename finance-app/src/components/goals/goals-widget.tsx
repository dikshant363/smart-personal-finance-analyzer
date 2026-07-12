"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, AlertTriangle } from "lucide-react";

interface Goal {
  id: string;
  name: string;
  progress: number;
  targetAmount: number;
  priority: string;
  type: string;
  forecastCompletion?: string | null;
  status: string;
}

export default function GoalsWidget({ currency }: { currency: string }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [goals, setGoals] = React.useState<Goal[]>([]);

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

  const priorityVariant: Record<string, "default" | "success" | "warning" | "danger"> = {
    low: "default",
    medium: "warning",
    high: "danger",
    critical: "danger",
  };

  return (
    <div className="space-y-4">
      {goals.map((g) => (
        <div key={g.id} className="space-y-1.5 border-b border-neutral-100 dark:border-neutral-800 pb-3 last:border-b-0 last:pb-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {g.name}
              </span>
              <Badge variant={priorityVariant[g.priority] as any} className="text-[10px] px-1.5 py-0">
                {g.priority}
              </Badge>
              {g.status === "behind_schedule" && (
                <Badge variant="danger" className="text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                  <AlertTriangle className="h-2 w-2" /> Behind
                </Badge>
              )}
            </div>
            <span className="text-neutral-500 text-xs font-semibold">{g.progress}%</span>
          </div>

          <div className="mt-1">
            <Progress value={g.progress} />
          </div>

          {g.forecastCompletion && (
            <div className="flex items-center gap-1 text-[10px] text-neutral-400">
              <Calendar className="h-3 w-3 text-indigo-500" />
              <span>Est. Completion: {new Date(g.forecastCompletion).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
