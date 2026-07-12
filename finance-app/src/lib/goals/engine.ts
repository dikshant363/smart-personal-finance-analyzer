import { GoalRow } from "./repository";

export interface GoalCalculations {
  progressPercent: number;
  remainingAmount: number;
  remainingMonthsEstimated: number | null;
  remainingMonthsActual: number | null;
  averageMonthlySavingRequired: number | null;
  forecastCompletionDate: Date | null;
  status: string;
}

export function calculateGoalMetrics(goal: {
  targetAmount: number;
  currentAmount: number;
  deadline: Date | null;
  createdAt: Date;
  estimatedMonthlyContribution: number;
  actualMonthlyContribution: number;
  status: string;
}): GoalCalculations {
  const targetAmount = goal.targetAmount;
  const currentAmount = goal.currentAmount;
  const remainingAmount = Math.max(0, targetAmount - currentAmount);

  // 1. Progress Percent
  const progressPercent = targetAmount > 0
    ? Math.min(100, Math.round((currentAmount / targetAmount) * 100))
    : 0;

  // 2. Remaining Months
  const remainingMonthsEstimated = goal.estimatedMonthlyContribution > 0
    ? remainingAmount / goal.estimatedMonthlyContribution
    : null;

  const remainingMonthsActual = goal.actualMonthlyContribution > 0
    ? remainingAmount / goal.actualMonthlyContribution
    : null;

  // 3. Average Monthly Saving Required
  let averageMonthlySavingRequired: number | null = null;
  let forecastCompletionDate: Date | null = null;

  const now = new Date();
  if (goal.deadline) {
    const deadlineTime = goal.deadline.getTime();
    const nowTime = now.getTime();
    const diffMs = deadlineTime - nowTime;

    if (diffMs > 0) {
      // Approximate months remaining
      const monthsRemaining = Math.max(0.1, diffMs / (30 * 24 * 60 * 60 * 1000));
      averageMonthlySavingRequired = remainingAmount / monthsRemaining;
    } else {
      averageMonthlySavingRequired = remainingAmount; // already passed deadline
    }
  }

  // 4. Forecast Completion Date
  const activeRate = goal.actualMonthlyContribution > 0
    ? goal.actualMonthlyContribution
    : goal.estimatedMonthlyContribution;

  if (activeRate > 0 && remainingAmount > 0) {
    const monthsNeeded = remainingAmount / activeRate;
    const daysNeeded = Math.ceil(monthsNeeded * 30.436); // Average days in month
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysNeeded);
    forecastCompletionDate = completionDate;
  } else if (remainingAmount === 0) {
    forecastCompletionDate = now;
  }

  // 5. Automatic Status Transitions
  let status = goal.status;
  if (progressPercent >= 100) {
    status = "completed";
  } else if (goal.status !== "paused" && goal.status !== "archived" && goal.status !== "cancelled") {
    if (goal.deadline) {
      const deadlineTime = goal.deadline.getTime();
      const nowTime = now.getTime();

      if (nowTime > deadlineTime) {
        status = "behind_schedule";
      } else {
        // Calculate expected progress based on linear timeline
        const createdTime = goal.createdAt.getTime();
        const totalDuration = deadlineTime - createdTime;
        const elapsed = nowTime - createdTime;

        if (totalDuration > 0 && elapsed > 0) {
          const expectedProgressPercent = Math.min(100, (elapsed / totalDuration) * 100);
          const expectedProgressAmount = (targetAmount * expectedProgressPercent) / 100;

          // 10% grace margin
          if (currentAmount < expectedProgressAmount * 0.9) {
            status = "behind_schedule";
          } else if (currentAmount > expectedProgressAmount * 1.1) {
            status = "ahead_of_schedule";
          } else {
            status = "active";
          }
        } else {
          status = "active";
        }
      }
    } else {
      status = "active";
    }
  }

  return {
    progressPercent,
    remainingAmount,
    remainingMonthsEstimated,
    remainingMonthsActual,
    averageMonthlySavingRequired,
    forecastCompletionDate,
    status,
  };
}
