import { listRecurringItems } from "./repository";
import { prisma } from "@/lib/prisma";

export type Db = typeof prisma;

export interface SubscriptionOptimization {
  recurringItemId: string;
  name: string;
  type: "cancel_unused" | "downgrade" | "annual_plan" | "bundle";
  title: string;
  summary: string;
  explanation: string;
  potentialSavings: number;
}

export async function generateRecurringOptimizations(
  userId: string,
  db: Db = prisma
): Promise<SubscriptionOptimization[]> {
  const items = await listRecurringItems(userId, db);
  const optimizations: SubscriptionOptimization[] = [];

  for (const item of items) {
    if (item.status !== "Active" || item.type !== "Expense") continue;

    // Rule 1: Convert to Annual (if monthly and amount is significant)
    if (item.frequency === "Monthly" && item.amount >= 15) {
      const annualSavings = item.amount * 12 * 0.2; // assume 20% savings
      optimizations.push({
        recurringItemId: item.id,
        name: item.name,
        type: "annual_plan",
        title: `Switch "${item.name}" to Annual Plan`,
        summary: `Save up to ${item.currency} ${Math.round(annualSavings)}/year.`,
        explanation: `Most providers offer a 15-20% discount on yearly pre-payments. Switching your monthly subscription for ${item.name} to an annual billing cycle can save you ${item.currency} ${Math.round(annualSavings)} annually.`,
        potentialSavings: Math.round(annualSavings),
      });
    }

    // Rule 2: Review plan downgrade for high recurring expense
    if (item.amount > 50 && item.frequency === "Monthly") {
      const targetSavings = item.amount * 0.15; // assume 15% plan reduction
      optimizations.push({
        recurringItemId: item.id,
        name: item.name,
        type: "downgrade",
        title: `Review tier / Downgrade plan for "${item.name}"`,
        summary: `Trim costs by ${item.currency} ${Math.round(targetSavings)}/month.`,
        explanation: `Your monthly payment of ${item.currency} ${item.amount} for ${item.name} is high. Review your usage logs; downgrading to a lower plan tier or mobile-only option might cover your actual needs for less.`,
        potentialSavings: Math.round(targetSavings * 12),
      });
    }

    // Rule 3: Unused check
    // If lastPaidDate is more than 60 days ago but status is Active, suggest cancelling
    if (item.lastPaidDate) {
      const daysSinceLastPaid = (Date.now() - new Date(item.lastPaidDate).getTime()) / (24 * 60 * 60 * 1000);
      if (daysSinceLastPaid > 60 && item.frequency === "Monthly") {
        optimizations.push({
          recurringItemId: item.id,
          name: item.name,
          type: "cancel_unused",
          title: `Cancel inactive subscription: "${item.name}"`,
          summary: `Stop paying ${item.currency} ${item.amount}/month immediately.`,
          explanation: `We haven't detected any actual payment activity for "${item.name}" in the last 60 days, yet the schedule remains active. Earmark this subscription for cancellation to avoid automatic billings.`,
          potentialSavings: Math.round(item.amount * 12),
        });
      }
    }
  }

  // Rule 4: Bundle recommendations
  const streamingItems = items.filter(
    (i) => i.status === "Active" && (i.name.toLowerCase().includes("netflix") || i.name.toLowerCase().includes("disney") || i.name.toLowerCase().includes("hulu") || i.name.toLowerCase().includes("prime video"))
  );

  if (streamingItems.length >= 2) {
    optimizations.push({
      recurringItemId: streamingItems[0].id,
      name: "Streaming Services",
      type: "bundle",
      title: "Consolidate Entertainment Subscriptions",
      summary: "Bundle streaming options or rotate active subscriptions.",
      explanation: "You have multiple streaming services active concurrently. Rotating them monthly (e.g. activate Netflix for 1 month, then switch to Disney+) or seeking bundle discounts can reduce entertainment overhead.",
      potentialSavings: 120,
    });
  }

  return optimizations;
}
