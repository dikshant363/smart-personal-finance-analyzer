"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { StoredRecommendation } from "@/lib/recommendations/types";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";

const CATEGORIES = [
  "savings",
  "budget_optimization",
  "expense_reduction",
  "cashflow",
  "health_improvement",
  "emergency_fund",
  "income_opportunity",
  "subscription",
  "recurring_optimization",
  "category_optimization",
  "lifestyle",
  "seasonal",
  "risk_warning",
  "positive",
  "future_planning",
];

function priorityVariant(priority: string) {
  if (priority === "critical") return "danger";
  if (priority === "high") return "warning";
  return "default";
}

export function RecommendationsClient({ currency = "USD" }: { currency?: string }) {
  const router = useRouter();
  const [recs, setRecs] = React.useState<StoredRecommendation[]>([]);
  const [priority, setPriority] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("");
  const [status, setStatus] = React.useState("active");
  const [sort, setSort] = React.useState("priority");
  const [detail, setDetail] = React.useState<StoredRecommendation | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (priority) params.set("priority", priority);
    if (category) params.set("category", category);
    if (difficulty) params.set("difficulty", difficulty);
    if (status) params.set("status", status);
    if (sort) params.set("sort", sort);
    try {
      const res = await fetch("/api/recommendations?" + params.toString());
      const data = await res.json();
      setRecs(data.recommendations ?? []);
    } finally {
      setLoading(false);
    }
  }, [priority, category, difficulty, status, sort]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function setStatusOn(rec: StoredRecommendation, next: string) {
    await fetch(`/api/recommendations/${rec.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
    await load();
  }

  async function regenerate() {
    setLoading(true);
    await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate" }),
    });
    router.refresh();
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[10rem] flex-1">
          <Label htmlFor="r-priority">Priority</Label>
          <Select id="r-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All</option>
            <option value="critical">critical</option>
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </Select>
        </div>
        <div className="min-w-[12rem] flex-1">
          <Label htmlFor="r-category">Category</Label>
          <Select id="r-category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[10rem] flex-1">
          <Label htmlFor="r-difficulty">Difficulty</Label>
          <Select id="r-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">All</option>
            <option value="easy">easy</option>
            <option value="moderate">moderate</option>
            <option value="hard">hard</option>
          </Select>
        </div>
        <div className="min-w-[10rem] flex-1">
          <Label htmlFor="r-status">Status</Label>
          <Select id="r-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">active</option>
            <option value="accepted">accepted</option>
            <option value="completed">completed</option>
            <option value="dismissed">dismissed</option>
            <option value="archived">archived</option>
          </Select>
        </div>
        <div className="min-w-[10rem] flex-1">
          <Label htmlFor="r-sort">Sort</Label>
          <Select id="r-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="priority">priority</option>
            <option value="savings">savings</option>
            <option value="scoreImpact">scoreImpact</option>
            <option value="newest">newest</option>
            <option value="oldest">oldest</option>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={regenerate} disabled={loading}>
          Regenerate
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : recs.length === 0 ? (
        <EmptyState title="No recommendations yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recs.map((rec) => (
            <Card key={rec.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">{rec.title}</CardTitle>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="info">{rec.category}</Badge>
                  <Badge variant={priorityVariant(rec.priority)}>{rec.priority}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-2">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {rec.summary}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {rec.explanation || rec.reason}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatMoney(rec.monthlySavings, currency)}
                    <span className="font-normal text-neutral-500"> mo</span>
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatMoney(rec.annualSavings, currency)}
                    <span className="font-normal text-neutral-500"> yr</span>
                  </span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    +{rec.scoreImpact} pts
                  </span>
                </div>
                {rec.action ? (
                  <p className="text-sm italic text-neutral-600 dark:text-neutral-400">
                    {rec.action}
                  </p>
                ) : null}
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Button size="sm" onClick={() => setStatusOn(rec, "accepted")}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatusOn(rec, "dismissed")}>
                    Dismiss
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatusOn(rec, "completed")}>
                    Complete
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDetail(rec)}>
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={detail !== null} onClose={() => setDetail(null)} title={detail?.title}>
        {detail ? (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-1">
              <Badge variant="info">{detail.category}</Badge>
              <Badge variant={priorityVariant(detail.priority)}>{detail.priority}</Badge>
            </div>
            <div>
              <p className="font-medium text-neutral-700 dark:text-neutral-300">Why</p>
              <p className="text-neutral-600 dark:text-neutral-400">{detail.reason}</p>
            </div>
            <div>
              <p className="font-medium text-neutral-700 dark:text-neutral-300">Evidence</p>
              <p className="text-neutral-600 dark:text-neutral-400">{detail.evidence}</p>
            </div>
            <div>
              <p className="font-medium text-neutral-700 dark:text-neutral-300">Details</p>
              <p className="text-neutral-600 dark:text-neutral-400">{detail.explanation}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-neutral-500">Confidence</p>
                <p className="capitalize">{detail.confidence}</p>
              </div>
              <div>
                <p className="text-neutral-500">Difficulty</p>
                <p className="capitalize">{detail.difficulty}</p>
              </div>
              <div>
                <p className="text-neutral-500">Expires</p>
                <p>{detail.expiresAt ? new Date(detail.expiresAt).toLocaleDateString() : "—"}</p>
              </div>
            </div>
            {detail.action ? (
              <p className="italic text-neutral-600 dark:text-neutral-400">{detail.action}</p>
            ) : null}
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
