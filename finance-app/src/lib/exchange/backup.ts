import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export type Db = typeof prisma;

export interface ApplicationBackupPayload {
  version: string;
  timestamp: string;
  profile: any;
  categories: any[];
  transactions: any[];
  budgets: any[];
  goals: any[];
  recurringItems: any[];
}

export async function createApplicationBackup(
  userId: string,
  db: Db = prisma
): Promise<ApplicationBackupPayload> {
  const [profile, categories, transactions, budgets, goals, recurringItems] = await Promise.all([
    db.profile.findUnique({ where: { userId } }),
    db.category.findMany({ where: { userId } }),
    db.transaction.findMany({ where: { userId } }),
    db.budget.findMany({ where: { userId } }),
    db.goal.findMany({ where: { userId } }),
    db.recurringItem.findMany({ where: { userId } }),
  ]);

  // Log in the audit log table
  await db.exchangeAudit.create({
    data: {
      userId,
      action: "BACKUP",
      format: "JSON",
      dataset: "All",
      status: "success",
      recordCount: transactions.length + budgets.length + goals.length + recurringItems.length,
    },
  });

  return {
    version: "1.0",
    timestamp: new Date().toISOString(),
    profile,
    categories,
    transactions: transactions.map((t) => ({ ...t, amount: toNumber(t.amount) })),
    budgets: budgets.map((b) => ({ ...b, amount: toNumber(b.amount) })),
    goals: goals.map((g) => ({
      ...g,
      targetAmount: toNumber(g.targetAmount),
      currentAmount: toNumber(g.currentAmount),
    })),
    recurringItems: recurringItems.map((r) => ({ ...r, amount: toNumber(r.amount) })),
  };
}
