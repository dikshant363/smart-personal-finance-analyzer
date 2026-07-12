import { prisma } from "@/lib/prisma";
import { ApplicationBackupPayload } from "./backup";

export type Db = typeof prisma;

export interface RestoreOptions {
  restoreProfile?: boolean;
  restoreCategories?: boolean;
  restoreTransactions?: boolean;
  restoreBudgets?: boolean;
  restoreGoals?: boolean;
  restoreRecurringItems?: boolean;
}

export interface RestoreSummary {
  categoriesImported: number;
  transactionsImported: number;
  budgetsImported: number;
  goalsImported: number;
  recurringItemsImported: number;
}

export async function restoreApplicationBackup(
  userId: string,
  backup: ApplicationBackupPayload,
  options: RestoreOptions,
  db: Db = prisma
): Promise<RestoreSummary> {
  if (!backup || backup.version !== "1.0") {
    throw new Error("Invalid backup payload version. Only version 1.0 is supported.");
  }

  const summary: RestoreSummary = {
    categoriesImported: 0,
    transactionsImported: 0,
    budgetsImported: 0,
    goalsImported: 0,
    recurringItemsImported: 0,
  };

  // 1. Restore Profile Settings
  if (options.restoreProfile && backup.profile) {
    await db.profile.upsert({
      where: { userId },
      update: {
        currency: backup.profile.currency,
      },
      create: {
        userId,
        currency: backup.profile.currency,
      },
    });
  }

  // Map category names to their new database IDs to keep references consistent
  const categoryIdMap: Record<string, string> = {};

  // 2. Restore Categories
  if (options.restoreCategories && backup.categories && Array.isArray(backup.categories)) {
    for (const cat of backup.categories) {
      // Find if category name already exists for this user
      let existing = await db.category.findFirst({
        where: { userId, name: cat.name },
      });

      if (!existing) {
        existing = await db.category.create({
          data: {
            userId,
            name: cat.name,
            type: cat.type || "Expense",
            color: cat.color || "#cccccc",
          },
        });
        summary.categoriesImported++;
      }
      categoryIdMap[cat.id] = existing.id;
    }
  }

  // 3. Restore Transactions
  if (options.restoreTransactions && backup.transactions && Array.isArray(backup.transactions)) {
    for (const tx of backup.transactions) {
      // Skip exact duplicate check
      const txDate = new Date(tx.date);
      const exact = await db.transaction.findFirst({
        where: {
          userId,
          amount: tx.amount,
          type: tx.type,
          date: txDate,
          description: tx.description,
        },
      });

      if (!exact) {
        const mappedCatId = tx.categoryId ? categoryIdMap[tx.categoryId] || null : null;
        await db.transaction.create({
          data: {
            userId,
            type: tx.type,
            amount: tx.amount,
            currency: tx.currency || "USD",
            categoryId: mappedCatId,
            description: tx.description,
            date: txDate,
            source: tx.source || "Manual",
          },
        });
        summary.transactionsImported++;
      }
    }
  }

  // 4. Restore Budgets
  if (options.restoreBudgets && backup.budgets && Array.isArray(backup.budgets)) {
    for (const b of backup.budgets) {
      const mappedCatId = b.categoryId ? categoryIdMap[b.categoryId] || null : null;
      if (!mappedCatId) continue;

      // Upsert budget for that category
      const existing = await db.budget.findFirst({
        where: { userId, categoryId: mappedCatId },
      });

      if (!existing) {
        await db.budget.create({
          data: {
            userId,
            name: b.name || "Restored Budget",
            categoryId: mappedCatId,
            amount: b.amount !== undefined ? b.amount : (b.limit !== undefined ? b.limit : 0),
            period: b.period || "Monthly",
          },
        });
        summary.budgetsImported++;
      }
    }
  }

  // 5. Restore Goals
  if (options.restoreGoals && backup.goals && Array.isArray(backup.goals)) {
    for (const g of backup.goals) {
      const existing = await db.goal.findFirst({
        where: { userId, name: g.name },
      });

      if (!existing) {
        await db.goal.create({
          data: {
            userId,
            name: g.name,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount,
            deadline: new Date(g.deadline),
            type: g.type || "Savings",
            status: g.status || "Active",
          },
        });
        summary.goalsImported++;
      }
    }
  }

  // 6. Restore Recurring Items
  if (options.restoreRecurringItems && backup.recurringItems && Array.isArray(backup.recurringItems)) {
    for (const r of backup.recurringItems) {
      const existing = await db.recurringItem.findFirst({
        where: { userId, name: r.name },
      });

      if (!existing) {
        const mappedCatId = r.categoryId ? categoryIdMap[r.categoryId] || null : null;
        await db.recurringItem.create({
          data: {
            userId,
            name: r.name,
            type: r.type,
            amount: r.amount,
            frequency: r.frequency,
            expectedNextDate: new Date(r.expectedNextDate),
            lastPaidDate: r.lastPaidDate ? new Date(r.lastPaidDate) : null,
            status: r.status || "Active",
            categoryId: mappedCatId,
          },
        });
        summary.recurringItemsImported++;
      }
    }
  }

  // Log audit
  await db.exchangeAudit.create({
    data: {
      userId,
      action: "RESTORE",
      format: "JSON",
      dataset: "All",
      status: "success",
      recordCount: Object.values(summary).reduce((a, b) => a + b, 0),
    },
  });

  return summary;
}
