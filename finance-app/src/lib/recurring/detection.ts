import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export type Db = typeof prisma;

export interface DetectedRecurringItem {
  name: string;
  categoryId: string | null;
  type: "Income" | "Expense";
  frequency: "Daily" | "Weekly" | "Biweekly" | "Monthly" | "Quarterly" | "Annual" | "Custom";
  amount: number;
  expectedNextDate: Date;
  confidence: number;
}

export async function detectRecurringTransactions(
  userId: string,
  db: Db = prisma
): Promise<DetectedRecurringItem[]> {
  // Fetch all user transactions in the last 180 days
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: { gte: start, lte: now },
    },
    orderBy: { date: "asc" },
  });

  // Group by name (case-insensitive, normalized description)
  const groups: Record<string, typeof transactions> = {};
  for (const t of transactions) {
    const key = `${t.type}_${(t.description || "").trim().toLowerCase()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }

  const detected: DetectedRecurringItem[] = [];

  for (const key of Object.keys(groups)) {
    const list = groups[key];
    if (list.length < 3) continue; // Need at least 3 occurrences to verify recurring

    // Calculate dates intervals (in days)
    const dates = list.map((t) => new Date(t.date).getTime());
    const intervals: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      const diffDays = (dates[i] - dates[i - 1]) / (24 * 60 * 60 * 1000);
      intervals.push(diffDays);
    }

    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const stdDev = Math.sqrt(
      intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length
    );

    // Check if intervals are uniform (low stdDev relative to avgInterval, e.g. stdDev < 4 days)
    const isUniform = stdDev < 5;

    let frequency: DetectedRecurringItem["frequency"] | null = null;
    let confidence = 0.5;

    if (isUniform) {
      if (avgInterval >= 6 && avgInterval <= 8) {
        frequency = "Weekly";
        confidence = 0.85;
      } else if (avgInterval >= 12 && avgInterval <= 16) {
        frequency = "Biweekly";
        confidence = 0.85;
      } else if (avgInterval >= 26 && avgInterval <= 34) {
        frequency = "Monthly";
        confidence = 0.9;
      } else if (avgInterval >= 85 && avgInterval <= 95) {
        frequency = "Quarterly";
        confidence = 0.8;
      } else if (avgInterval >= 350 && avgInterval <= 380) {
        frequency = "Annual";
        confidence = 0.75;
      } else if (avgInterval >= 0.8 && avgInterval <= 1.2) {
        frequency = "Daily";
        confidence = 0.7;
      }
    }

    if (!frequency) continue;

    // Check amount similarity
    const amounts = list.map((t) => toNumber(t.amount));
    const avgAmount = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
    const amountVariance = Math.sqrt(
      amounts.reduce((sum, val) => sum + Math.pow(val - avgAmount, 2), 0) / amounts.length
    );

    const isAmountSimilar = avgAmount > 0 ? amountVariance / avgAmount < 0.1 : true;
    if (isAmountSimilar) {
      confidence += 0.1;
    }

    if (confidence >= 0.7) {
      const lastTx = list[list.length - 1];
      const lastDate = new Date(lastTx.date);

      // Project expected next date
      const expectedNextDate = new Date(lastDate);
      if (frequency === "Weekly") expectedNextDate.setDate(expectedNextDate.getDate() + 7);
      else if (frequency === "Biweekly") expectedNextDate.setDate(expectedNextDate.getDate() + 14);
      else if (frequency === "Monthly") expectedNextDate.setMonth(expectedNextDate.getMonth() + 1);
      else if (frequency === "Quarterly") expectedNextDate.setMonth(expectedNextDate.getMonth() + 3);
      else if (frequency === "Annual") expectedNextDate.setFullYear(expectedNextDate.getFullYear() + 1);
      else if (frequency === "Daily") expectedNextDate.setDate(expectedNextDate.getDate() + 1);

      detected.push({
        name: lastTx.description || "Recurring Transaction",
        categoryId: lastTx.categoryId,
        type: lastTx.type,
        frequency,
        amount: Math.round(avgAmount * 100) / 100,
        expectedNextDate,
        confidence: Math.min(1.0, confidence),
      });
    }
  }

  return detected;
}
