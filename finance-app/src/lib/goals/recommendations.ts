import { prisma } from "@/lib/prisma";
import { listGoals } from "./repository";
import { calculateGoalMetrics } from "./engine";
import { getGoalForecasts } from "./forecast";
import { analyzeSpending } from "@/lib/analysis/analyze";

export type Db = typeof prisma;

export interface GoalRecommendation {
  goalId: string;
  goalName: string;
  type: string;
  title: string;
  summary: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  potentialSavings: number;
}

export async function generateGoalRecommendations(
  userId: string,
  db: Db = prisma
): Promise<GoalRecommendation[]> {
  const recommendations: GoalRecommendation[] = [];

  const [goals, forecastsData, spendingAnalysis] = await Promise.all([
    listGoals(userId, "active", db),
    getGoalForecasts(userId, db),
    analyzeSpending(userId, db),
  ]);

  for (const goal of goals) {
    const metrics = calculateGoalMetrics({
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline ? new Date(goal.deadline) : null,
      createdAt: new Date(goal.createdAt),
      estimatedMonthlyContribution: goal.estimatedMonthlyContribution,
      actualMonthlyContribution: goal.actualMonthlyContribution,
      status: goal.status,
    });

    const forecast = forecastsData.forecasts.find((f) => f.id === goal.id);

    // 1. Goal is Behind Schedule
    if (metrics.status === "behind_schedule" && goal.deadline) {
      const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
      const monthsLeft = Math.max(1, (new Date(goal.deadline).getTime() - Date.now()) / (30 * 86400000));
      const requiredSaving = remainingAmount / monthsLeft;
      const currentRate = goal.actualMonthlyContribution > 0 ? goal.actualMonthlyContribution : goal.estimatedMonthlyContribution;
      const shortfall = requiredSaving - currentRate;

      if (shortfall > 0) {
        recommendations.push({
          goalId: goal.id,
          goalName: goal.name,
          type: "savings_increase",
          title: `Increase monthly savings for "${goal.name}"`,
          summary: `Save an additional ${goal.currency} ${Math.round(shortfall)}/month to meet your deadline.`,
          explanation: `Your current saving rate of ${goal.currency} ${currentRate}/month is not enough to hit your target by ${new Date(goal.deadline).toLocaleDateString()}. Increasing this by ${goal.currency} ${Math.round(shortfall)} will keep you on track.`,
          difficulty: shortfall < 100 ? "easy" : shortfall < 400 ? "medium" : "hard",
          potentialSavings: shortfall,
        });
      }
    }

    // 2. Spending cut suggestions
    if (metrics.status === "behind_schedule") {
      // Find category with high spending to suggest reduction
      const topExpense = spendingAnalysis.insights.find((i) => i.title.toLowerCase().includes("top"));
      if (topExpense) {
        recommendations.push({
          goalId: goal.id,
          goalName: goal.name,
          type: "expense_cut",
          title: `Trim expenses to fund "${goal.name}"`,
          summary: `Reduce dining or discretionary spending to redirect funds to your goal.`,
          explanation: `Discretionary category spending is higher than average. Saving money there can directly accelerate your "${goal.name}" goal.`,
          difficulty: "easy",
          potentialSavings: 50,
        });
      }
    }

    // 3. Positive reinforcement for Ahead of Schedule
    if (metrics.status === "ahead_of_schedule") {
      recommendations.push({
        goalId: goal.id,
        goalName: goal.name,
        type: "reinforcement",
        title: `You are ahead of schedule for "${goal.name}"!`,
        summary: `Keep up the great work. You are set to achieve this goal earlier than planned.`,
        explanation: `Due to consistent monthly contributions and healthy budgeting habits, you are pacing to complete your "${goal.name}" goal ahead of your deadline.`,
        difficulty: "easy",
        potentialSavings: 0,
      });
    }
  }

  return recommendations;
}
