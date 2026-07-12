import { json, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { calculateHealthScore } from "@/lib/score/engine";
import { listRecommendations } from "@/lib/recommendations/repository";
import { getRecurringAnalytics } from "@/lib/recurring";
import { toNumber } from "@/lib/currency";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    const [profile, txSum, score, recommendations, recurring, goals, budgets] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: user.id } }),
      prisma.transaction.groupBy({
        by: ["type"],
        where: { userId: user.id },
        _sum: { amount: true },
      }),
      calculateHealthScore(user.id),
      listRecommendations(user.id),
      getRecurringAnalytics(user.id),
      prisma.goal.findMany({ where: { userId: user.id } }),
      prisma.budget.findMany({ where: { userId: user.id }, include: { category: true } }),
    ]);

    const totalIncome = toNumber(txSum.find((t: any) => t.type === "Income")?._sum.amount || 0);
    const totalExpense = toNumber(txSum.find((t: any) => t.type === "Expense")?._sum.amount || 0);

    return json({
      timestamp: new Date().toISOString(),
      profile: {
        currency: profile?.currency || "USD",
      },
      summary: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
      },
      financialHealth: {
        score: score.score,
        tier: score.band,
        metrics: score.dimensions,
      },
      recurringCommitments: {
        monthlyRecurringExpenses: recurring.monthlyRecurringExpenses,
        recurringExpenseRatio: recurring.recurringExpenseRatio,
      },
      goals: goals.map((g: any) => ({
        name: g.name,
        targetAmount: toNumber(g.targetAmount),
        currentAmount: toNumber(g.currentAmount),
        status: g.status,
      })),
      budgets: budgets.map((b: any) => ({
        categoryName: b.category?.name || "Uncategorized",
        limit: toNumber(b.amount), // budget limit property is actually 'amount'!
      })),
      recommendations: recommendations.map((r: any) => ({
        title: r.title,
        summary: r.summary,
        impact: r.impact,
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}
