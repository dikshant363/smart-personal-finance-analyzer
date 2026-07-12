import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toNumber, formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { analyzeSpending } from "@/lib/analysis/analyze";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import DashboardInsightsWidget from "@/components/dashboard/dashboard-insights-widget";
import { calculateHealthScore } from "@/lib/score/engine";
import { saveMonthlySnapshot, getHistory } from "@/lib/score/store";
import { HealthScoreCard } from "@/components/score/health-score-card";
import { SpendingIntelligence } from "@/components/analysis/spending-intelligence";
import { listRecommendations } from "@/lib/recommendations/repository";
import { RecommendationsSummary } from "@/components/recommendations/recommendations-summary";
import { RiskDetector } from "@/components/forecasting/risk-detector";
import { AiInsightsFeed } from "@/components/ai-insights/ai-insights-feed";
import GoalsWidget from "@/components/goals/goals-widget";
import EmergencyWidget from "@/components/emergency-fund/emergency-widget";
import RecurringWidget from "@/components/recurring/recurring-widget";
import TimelineWidget from "@/components/timeline/timeline-widget";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalsRaw, recentRaw, budgetsRaw, profile] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId: user.id, date: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 6,
      include: { category: { select: { name: true, color: true } } },
    }),
    prisma.budget.findMany({
      where: { userId: user.id },
      include: { category: { select: { name: true, color: true } } },
      take: 4,
    }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const totals: Record<string, number> = { income: 0, expense: 0, net: 0 };
  for (const row of totalsRaw) {
    const sum = toNumber(row._sum.amount);
    if (row.type === "Income") totals.income = sum;
    if (row.type === "Expense") totals.expense = sum;
  }
  totals.net = totals.income - totals.expense;

  const currency = profile?.currency ?? "USD";

  const scoreResult = await calculateHealthScore(user.id);
  await saveMonthlySnapshot(user.id, scoreResult);
  const scoreHistory = await getHistory(user.id);
  const prevScore =
    scoreHistory.length > 1
      ? scoreHistory[scoreHistory.length - 2].score
      : null;
  const trendDelta = prevScore != null ? scoreResult.score - prevScore : null;

  const analysis = await analyzeSpending(user.id);

  const recs = await listRecommendations(user.id, { status: "active" }, "priority");

  const recent = recentRaw.map((tx) => ({
    ...tx,
    amount: toNumber(tx.amount),
    date: tx.date.toISOString(),
  }));

  const budgets = await Promise.all(
    budgetsRaw.map(async (budget) => {
      const where: any = {
        userId: user.id,
        type: "Expense",
        date: { gte: monthStart },
      };
      if (budget.categoryId) where.categoryId = budget.categoryId;

      const spentAgg = await prisma.transaction.aggregate({
        where,
        _sum: { amount: true },
      });

      const amount = toNumber(budget.amount);
      const spent = toNumber(spentAgg._sum.amount);
      const percent = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;

      return {
        id: budget.id,
        name: budget.category?.name ?? budget.name,
        color: budget.category?.color ?? "#6366f1",
        amount,
        spent,
        percent,
      };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Welcome back, {user.name ?? "there"}
      </h1>

      <HealthScoreCard
        score={scoreResult.score}
        band={scoreResult.band}
        trendDelta={trendDelta}
        lastUpdated={scoreResult.calculatedAt}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {formatMoney(totals.income, currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {formatMoney(totals.expense, currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-2xl font-semibold",
                totals.net >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {formatMoney(totals.net, currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Active Budgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {budgets.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Add your first transaction to see it here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Date</TH>
                  <TH>Description</TH>
                  <TH>Category</TH>
                  <TH>Type</TH>
                  <TH className="text-right">Amount</TH>
                </TR>
              </THead>
              <TBody>
                {recent.map((tx) => (
                  <TR key={tx.id}>
                    <TD>
                      {new Date(tx.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TD>
                    <TD>{tx.description ?? "—"}</TD>
                    <TD>
                      {tx.category ? (
                        <Badge
                          variant="default"
                          className="font-normal"
                          style={{
                            backgroundColor: (tx.category.color ?? "#6366f1") + "20",
                            color: tx.category.color ?? "#6366f1",
                          }}
                        >
                          {tx.category.name}
                        </Badge>
                      ) : (
                        <span className="text-neutral-500">Uncategorized</span>
                      )}
                    </TD>
                    <TD>
                      <Badge
                        variant={
                          tx.type === "Income" ? "success" : "danger"
                        }
                      >
                        {tx.type}
                      </Badge>
                    </TD>
                    <TD className="text-right font-medium">
                      {formatMoney(tx.amount, currency)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget progress</CardTitle>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <EmptyState
              title="No budgets set"
              description="Create a budget to track spending against your limits."
            />
          ) : (
            <div className="space-y-4">
              {budgets.map((b) => {
                const color =
                  b.percent < 80
                    ? "bg-green-500"
                    : b.percent < 100
                      ? "bg-amber-500"
                      : "bg-red-500";

                return (
                  <div key={b.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {b.name}
                      </span>
                      <span className="text-neutral-500">
                        {formatMoney(b.spent, currency)} of{" "}
                        {formatMoney(b.amount, currency)} —{" "}
                        {Math.round(b.percent)}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800">
                      <div
                        className={cn("h-2 rounded-full", color)}
                        style={{ width: `${b.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Resilience</CardTitle>
        </CardHeader>
        <CardContent>
          <EmergencyWidget currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recurring Commitments</CardTitle>
        </CardHeader>
        <CardContent>
          <RecurringWidget currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Planning Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineWidget currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalsWidget currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardInsightsWidget currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spending Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <SpendingIntelligence result={analysis} currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <RecommendationsSummary recs={recs} currency={currency} />
        </CardContent>
      </Card>

      <RiskDetector userId={user.id} />

      <AiInsightsFeed userId={user.id} />
    </div>
  );
}
