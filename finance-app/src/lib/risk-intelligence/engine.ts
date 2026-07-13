import { prisma } from "@/lib/prisma";

export interface RiskAlert {
  id: string;
  category: string;
  severity: "Low" | "Moderate" | "High" | "Critical";
  confidence: number; // 0-100 percentage
  evidence: string;
  affectedModules: string[];
  mitigation: string;
  timestamp: Date;
}

export interface RiskScorecard {
  overallRiskScore: number; // 0 (no risk) to 100 (critical risk)
  alerts: RiskAlert[];
  trend: "Improving" | "Stable" | "Worsening";
}

export async function evaluatePredictiveRisks(userId: string, db = prisma): Promise<RiskScorecard> {
  const alerts: RiskAlert[] = [];

  const [accounts, investments, goals, recurring] = await Promise.all([
    db.account.findMany({ where: { userId } }),
    db.investment.findMany({ where: { userId } }),
    db.goal.findMany({ where: { userId, status: "Active" } }),
    db.recurringItem ? db.recurringItem.findMany({ where: { userId, status: "Active" } }) : Promise.resolve([]),
  ]);

  const totalAssets = accounts.reduce((acc: number, a: any) => acc + Number(a.currentBalance), 0) +
                      investments.reduce((acc: number, i: any) => acc + Number(i.currentValue), 0);

  // 1. Emergency Fund Risk
  const monthlyExpenses = 3000; // standard baseline estimate
  const liquidCash = accounts.filter((a: any) => a.type === "Savings" || a.type === "Checking")
                             .reduce((acc: number, a: any) => acc + Number(a.currentBalance), 0);
  const monthsCovered = liquidCash / monthlyExpenses;

  if (monthsCovered < 3) {
    alerts.push({
      id: "EF_LOW",
      category: "Emergency Fund Risk",
      severity: monthsCovered < 1 ? "Critical" : "High",
      confidence: 95,
      evidence: `Liquid cash of $${liquidCash.toFixed(2)} covers only ${monthsCovered.toFixed(1)} months of expenses (minimum target is 3-6 months).`,
      affectedModules: ["Emergency Fund", "Liquidity Overview"],
      mitigation: "Increase cash reserves by routing discretionary budget overflows directly into your Checking/Savings accounts.",
      timestamp: new Date(),
    });
  }

  // 2. Goal Overrun / Lag Risk
  for (const g of goals) {
    const current = Number(g.currentAmount);
    const target = Number(g.targetAmount);
    const progress = target > 0 ? (current / target) * 100 : 100;
    
    // Check if goal is past target date but target amount not achieved
    if (g.deadline && new Date(g.deadline) < new Date() && current < target) {
      alerts.push({
        id: `GOAL_LAG_${g.id}`,
        category: "Goal Completion Risk",
        severity: "High",
        confidence: 90,
        evidence: `Goal "${g.name}" has target date of ${new Date(g.deadline).toLocaleDateString()} but has only achieved ${progress.toFixed(1)}% of its target amount.`,
        affectedModules: ["Goals", "Timeline"],
        mitigation: "Extend the target completion timeline or increment monthly recurring contributions to close the savings gap.",
        timestamp: new Date(),
      });
    }
  }

  // 3. Investment Concentration Risk
  const totalInvestments = investments.reduce((acc: number, i: any) => acc + Number(i.currentValue), 0);
  for (const inv of investments) {
    const value = Number(inv.currentValue);
    const ratio = totalInvestments > 0 ? (value / totalInvestments) * 100 : 0;

    if (ratio > 40) {
      alerts.push({
        id: `CONC_${inv.id}`,
        category: "Investment Concentration Risk",
        severity: "Moderate",
        confidence: 85,
        evidence: `Holding "${inv.name}" accounts for ${ratio.toFixed(1)}% of total portfolio value (exceeds recommended limit of 30-40% per single asset).`,
        affectedModules: ["Investments", "Net Worth Summary"],
        mitigation: "Rebalance holdings by allocating new funds to diversified ETFs, broad market funds, or watchlisted instruments.",
        timestamp: new Date(),
      });
    }
  }

  // 4. Recurring Expenses Growth Check
  if (recurring && recurring.length > 5) {
    alerts.push({
      id: "REC_EXP_HIGH",
      category: "Recurring Expense Risk",
      severity: "Low",
      confidence: 70,
      evidence: `You have ${recurring.length} active recurring subscriptions and bill cycles.`,
      affectedModules: ["Recurring Transactions", "Cash Flow Summary"],
      mitigation: "Audit your inactive memberships or merge overlapping streaming/utility services to decrease monthly fixed costs.",
      timestamp: new Date(),
    });
  }

  // Determine overall risk score based on severities of active alerts
  let scoreSum = 0;
  for (const a of alerts) {
    if (a.severity === "Critical") scoreSum += 40;
    else if (a.severity === "High") scoreSum += 25;
    else if (a.severity === "Moderate") scoreSum += 15;
    else scoreSum += 5;
  }
  const overallRiskScore = Math.min(100, Math.max(0, scoreSum));

  return {
    overallRiskScore,
    alerts,
    trend: overallRiskScore > 40 ? "Worsening" : "Stable",
  };
}
