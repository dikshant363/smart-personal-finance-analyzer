import { prisma } from "@/lib/prisma";
import { getUpcomingPayments } from "@/lib/recurring/schedule";
import { calculateHealthScore } from "@/lib/score/engine";
import { listRecommendations } from "@/lib/recommendations/repository";
import { toNumber } from "@/lib/currency";

export type Db = typeof prisma;

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  type:
    | "Income"
    | "Expense"
    | "Recurring"
    | "BudgetMilestone"
    | "GoalMilestone"
    | "GoalCompletion"
    | "Recommendation"
    | "HealthChange"
    | "ForecastRisk"
    | "DocumentProcessed"
    | "InvestmentPurchase"
    | "InvestmentSale"
    | "DividendReceived"
    | "PortfolioMilestone";
  priority: "high" | "medium" | "low";
  timestamp: Date;
  status: "Upcoming" | "Scheduled" | "Completed" | "Cancelled" | "Missed" | "Overdue";
  module: string;
  amount?: number;
  metadata?: any;
}

export async function getUnifiedTimeline(
  userId: string,
  start: Date,
  end: Date,
  db: Db = prisma
): Promise<TimelineEvent[]> {
  const events: TimelineEvent[] = [];

  // 1. Fetch Transactions
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
    include: { category: true },
  });

  for (const t of transactions) {
    events.push({
      id: `tx_${t.id}`,
      title: t.type === "Income" ? `Income Received: ${t.description}` : `Expense Recorded: ${t.description}`,
      description: `Category: ${t.category?.name || "Uncategorized"}`,
      type: t.type === "Income" ? "Income" : "Expense",
      priority: toNumber(t.amount) > 500 ? "high" : "low",
      timestamp: new Date(t.date),
      status: "Completed",
      module: "Transactions",
      amount: toNumber(t.amount),
    });
  }

  // 2. Fetch Recurring Payments (upcoming / overdue)
  try {
    const recurrings = await getUpcomingPayments(userId, start, end, db);
    for (const r of recurrings) {
      events.push({
        id: `rec_${r.recurringItemId}_${r.dueDate.getTime()}`,
        title: `Recurring obligation: ${r.name}`,
        description: `Expected recurring ${r.type.toLowerCase()} of ${r.amount}`,
        type: "Recurring",
        priority: r.amount > 200 ? "medium" : "low",
        timestamp: new Date(r.dueDate),
        status: r.status === "Paid" ? "Completed" : r.status === "Overdue" ? "Overdue" : "Scheduled",
        module: "Recurring",
        amount: r.amount,
      });
    }
  } catch (err) {
    console.error("Timeline aggregate recurring fetch error:", err);
  }

  // 3. Fetch Goals and Milestones
  const goals = await db.goal.findMany({
    where: { userId },
  });

  for (const g of goals) {
    const target = toNumber(g.targetAmount);
    const current = toNumber(g.currentAmount);

    if (g.deadline && g.deadline >= start && g.deadline <= end) {
      events.push({
        id: `goal_deadline_${g.id}`,
        title: `Goal Target Deadline: ${g.name}`,
        description: `Target amount: ${target}. Current amount achieved: ${current}`,
        type: current >= target ? "GoalCompletion" : "GoalMilestone",
        priority: "high",
        timestamp: new Date(g.deadline),
        status: current >= target ? "Completed" : "Upcoming",
        module: "Goals",
      });
    }
  }

  // 4. Fetch Active Recommendations
  try {
    const recs = await listRecommendations(userId, { status: "active" }, "priority", db);
    for (const r of recs) {
      const createdDate = new Date(r.createdAt);
      if (createdDate >= start && createdDate <= end) {
        events.push({
          id: `rec_rec_${r.id}`,
          title: `Smart Recommendation: ${r.title}`,
          description: r.summary,
          type: "Recommendation",
          priority: r.priority === "high" ? "high" : r.priority === "medium" ? "medium" : "low",
          timestamp: createdDate,
          status: "Upcoming",
          module: "Recommendations",
        });
      }
    }
  } catch (err) {
    console.error("Timeline aggregate recommendations error:", err);
  }

  // 5. Fetch Score snapshots for Health Score changes
  try {
    const score = await calculateHealthScore(userId, db, { start, end });
    events.push({
      id: `score_${score.calculatedAt}`,
      title: `Financial Health Tier: ${score.band}`,
      description: `Calculated health index rating: ${score.score}/100.`,
      type: "HealthChange",
      priority: score.score < 50 ? "high" : "medium",
      timestamp: new Date(score.calculatedAt),
      status: "Completed",
      module: "HealthScore",
    });
  } catch (err) {
    console.error("Timeline aggregate score error:", err);
  }

  // 6. Fetch Investments (purchases/sales/milestones)
  try {
    const investmentDelegate = (db as any).investment;
    if (investmentDelegate) {
      const investments = await investmentDelegate.findMany({
        where: {
          userId,
          purchaseDate: { gte: start, lte: end },
        },
      });
      for (const inv of investments) {
        events.push({
          id: `inv_purchase_${inv.id}`,
          title: `Investment Purchased: ${inv.name}`,
          description: `Asset Class: ${inv.assetClass}. Quantity: ${inv.quantity} @ ${inv.purchasePrice} ${inv.currency}`,
          type: "InvestmentPurchase",
          priority: "medium",
          timestamp: new Date(inv.purchaseDate),
          status: "Completed",
          module: "Investments",
          amount: inv.purchasePrice * inv.quantity,
        });

        if (inv.status === "Sold") {
          events.push({
            id: `inv_sale_${inv.id}`,
            title: `Investment Sold: ${inv.name}`,
            description: `Asset Class: ${inv.assetClass}. Current valuation: ${inv.currentValue} ${inv.currency}`,
            type: "InvestmentSale",
            priority: "medium",
            timestamp: new Date(inv.updatedAt),
            status: "Completed",
            module: "Investments",
            amount: inv.currentValue,
          });
        }
      }
    }
  } catch (err) {
    console.error("Timeline aggregate investments error:", err);
  }

  // 7. Fetch Dividends
  try {
    const dividendDelegate = (db as any).dividend;
    if (dividendDelegate) {
      const dividends = await dividendDelegate.findMany({
        where: {
          investment: { userId },
          dividendDate: { gte: start, lte: end },
        },
        include: { investment: true },
      });
      for (const div of dividends) {
        events.push({
          id: `div_${div.id}`,
          title: `Dividend Received: ${div.investment.name}`,
          description: `Amount: ${div.amount} ${div.currency}. Reinvestment: ${div.reinvestmentStatus}`,
          type: "DividendReceived",
          priority: "low",
          timestamp: new Date(div.dividendDate),
          status: "Completed",
          module: "Investments",
          amount: div.amount,
        });
      }
    }
  } catch (err) {
    console.error("Timeline aggregate dividends error:", err);
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

