import { prisma } from "@/lib/prisma";
import { FinanceEvent } from "./event-bus";
import { sendNotification } from "./notification";
import { toNumber } from "@/lib/currency";

export async function evaluateRulesForEvent(event: FinanceEvent): Promise<number> {
  const { type, userId, payload } = event;
  let actionsCount = 0;

  if (type === "transaction.created") {
    // 1. Budget limits rule check
    const tx = payload;
    if (tx.categoryId) {
      const budget = await prisma.budget.findFirst({
        where: { userId, categoryId: tx.categoryId },
        include: { category: true },
      });

      if (budget) {
        // Calculate category expenses this month
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const sumResult = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: tx.categoryId,
            type: "Expense",
            date: { gte: start },
          },
          _sum: { amount: true },
        });

        const currentSpent = toNumber(sumResult._sum.amount || 0);
        const limitAmt = toNumber(budget.amount);
        const ratio = limitAmt > 0 ? currentSpent / limitAmt : 0;

        if (ratio >= 1.0) {
          await sendNotification(userId, {
            title: `Budget Exceeded: ${budget.name || budget.category?.name}`,
            body: `You've spent ${currentSpent} of your ${limitAmt} limit in ${budget.category?.name || "Uncategorized"}.`,
            type: "critical",
          });
          actionsCount++;
        } else if (ratio >= 0.9) {
          await sendNotification(userId, {
            title: `Budget Warning: ${budget.name || budget.category?.name}`,
            body: `You've used ${Math.round(ratio * 100)}% of your ${limitAmt} budget for ${budget.category?.name || "Uncategorized"}.`,
            type: "warning",
          });
          actionsCount++;
        }
      }
    }
  }

  if (type === "goal.progress_changed") {
    const goal = payload;
    const current = toNumber(goal.currentAmount);
    const target = toNumber(goal.targetAmount);

    if (current >= target) {
      await sendNotification(userId, {
        title: `Goal Achieved! 🏆`,
        body: `Congratulations! You've successfully hit your goal of saving for ${goal.name}.`,
        type: "achievement",
      });
      actionsCount++;
    } else if (current / target >= 0.5) {
      // Send reminder on half-way milestone if not already sent
      await sendNotification(userId, {
        title: `Goal Milestone: ${goal.name}`,
        body: `Halfway there! You've saved ${current} towards your ${target} goal.`,
        type: "success",
      });
      actionsCount++;
    }
  }

  if (type === "emergency.changed") {
    const readiness = payload; // readiness score
    if (readiness < 60) {
      await sendNotification(userId, {
        title: "Emergency Resilience Alert",
        body: "Your Emergency Readiness Score is low. We recommend budgeting essential savings.",
        type: "recommendation",
      });
      actionsCount++;
    }
  }

  return actionsCount;
}
