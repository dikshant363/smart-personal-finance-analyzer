import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";
import { TransactionType, TransactionSource } from "@prisma/client";

export interface SyncResult {
  accountsImported: number;
  transactionsImported: number;
  duplicatesFound: number;
  warningsCount: number;
  errorsCount: number;
  logMessage: string;
}

export interface FinancialConnector {
  sync(userId: string, inputData?: string, db?: any): Promise<SyncResult>;
}

// 1. Mock Provider Adapter
export class MockProvider implements FinancialConnector {
  async sync(userId: string, inputData?: string, db = prisma): Promise<SyncResult> {
    const mockTx = [
      { amount: 120, description: "Starbucks Coffee", type: "Expense" as const, category: "Food" },
      { amount: 2500, description: "Salary Deposit", type: "Income" as const, category: "Salary" },
    ];

    let transactionsImported = 0;
    let duplicatesFound = 0;

    for (const tx of mockTx) {
      const duplicate = await db.transaction.findFirst({
        where: {
          userId,
          amount: tx.amount,
          description: tx.description,
          type: tx.type,
        },
      });

      if (duplicate) {
        duplicatesFound++;
        continue;
      }

      // Try to find a matching category
      const categoryRecord = await db.category.findFirst({
        where: {
          userId,
          name: { equals: tx.category, mode: "insensitive" },
        },
      });

      await db.transaction.create({
        data: {
          userId,
          amount: tx.amount,
          description: tx.description,
          type: tx.type,
          categoryId: categoryRecord?.id ?? null,
          date: new Date(),
          source: TransactionSource.Import,
        },
      });
      transactionsImported++;
    }

    return {
      accountsImported: 1,
      transactionsImported,
      duplicatesFound,
      warningsCount: 0,
      errorsCount: 0,
      logMessage: "Successfully simulated Plaid-Mock banking feed.",
    };
  }
}

// 2. CSV Parser Provider Adapter
export class CSVProvider implements FinancialConnector {
  async sync(userId: string, inputData?: string, db = prisma): Promise<SyncResult> {
    if (!inputData) throw new Error("No CSV payload provided");

    const lines = inputData.split("\n").filter((l) => l.trim() !== "");
    if (lines.length < 2) {
      return {
        accountsImported: 0,
        transactionsImported: 0,
        duplicatesFound: 0,
        warningsCount: 1,
        errorsCount: 0,
        logMessage: "CSV payload is empty or has only headers",
      };
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    let imported = 0;
    let duplicates = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.length < headers.length) continue;

      const dateIdx = headers.indexOf("date");
      const amountIdx = headers.indexOf("amount");
      const descIdx = headers.indexOf("description");
      const typeIdx = headers.indexOf("type");
      const catIdx = headers.indexOf("category");

      const amount = parseFloat(cols[amountIdx]) || 0;
      const desc = cols[descIdx] || "CSV Transaction";
      const rawType = cols[typeIdx] || "Expense";
      const txType: TransactionType = rawType.toLowerCase() === "income" ? TransactionType.Income : TransactionType.Expense;
      const catName = cols[catIdx] || "Custom";
      const date = cols[dateIdx] ? new Date(cols[dateIdx]) : new Date();

      const duplicate = await db.transaction.findFirst({
        where: {
          userId,
          amount,
          description: desc,
          type: txType,
        },
      });

      if (duplicate) {
        duplicates++;
        continue;
      }

      const categoryRecord = await db.category.findFirst({
        where: {
          userId,
          name: { equals: catName, mode: "insensitive" },
        },
      });

      await db.transaction.create({
        data: {
          userId,
          amount,
          description: desc,
          type: txType,
          categoryId: categoryRecord?.id ?? null,
          date,
          source: TransactionSource.Import,
        },
      });
      imported++;
    }

    return {
      accountsImported: 0,
      transactionsImported: imported,
      duplicatesFound: duplicates,
      warningsCount: 0,
      errorsCount: 0,
      logMessage: `Imported ${imported} transaction entries from CSV payload.`,
    };
  }
}

// 3. JSON Parser Provider Adapter
export class JSONProvider implements FinancialConnector {
  async sync(userId: string, inputData?: string, db = prisma): Promise<SyncResult> {
    if (!inputData) throw new Error("No JSON payload provided");

    const payload = JSON.parse(inputData);
    const transactions = Array.isArray(payload) ? payload : [payload];

    let imported = 0;
    let duplicates = 0;

    for (const tx of transactions) {
      const amount = tx.amount || 0;
      const desc = tx.description || "JSON transaction";
      const rawType = tx.type || "Expense";
      const txType: TransactionType = rawType.toLowerCase() === "income" ? TransactionType.Income : TransactionType.Expense;
      const catName = tx.category || "Custom";
      const date = tx.date ? new Date(tx.date) : new Date();

      const duplicate = await db.transaction.findFirst({
        where: {
          userId,
          amount,
          description: desc,
          type: txType,
        },
      });

      if (duplicate) {
        duplicates++;
        continue;
      }

      const categoryRecord = await db.category.findFirst({
        where: {
          userId,
          name: { equals: catName, mode: "insensitive" },
        },
      });

      await db.transaction.create({
        data: {
          userId,
          amount,
          description: desc,
          type: txType,
          categoryId: categoryRecord?.id ?? null,
          date,
          source: TransactionSource.Import,
        },
      });
      imported++;
    }

    return {
      accountsImported: 0,
      transactionsImported: imported,
      duplicatesFound: duplicates,
      warningsCount: 0,
      errorsCount: 0,
      logMessage: `Imported ${imported} transaction entries from JSON payload.`,
    };
  }
}

// Sync execution manager
export async function executeSync(
  userId: string,
  providerName: "Mock" | "CSV" | "JSON",
  inputData?: string,
  db = prisma
): Promise<SyncResult> {
  const startTime = Date.now();

  const historyRecord = await db.syncHistory.create({
    data: {
      userId,
      provider: providerName,
      status: "Started",
    },
  });

  let connector: FinancialConnector;
  if (providerName === "Mock") {
    connector = new MockProvider();
  } else if (providerName === "CSV") {
    connector = new CSVProvider();
  } else {
    connector = new JSONProvider();
  }

  try {
    const result = await connector.sync(userId, inputData, db);
    const durationMs = Date.now() - startTime;

    await db.syncHistory.update({
      where: { id: historyRecord.id },
      data: {
        status: "Completed",
        completedAt: new Date(),
        durationMs,
        itemsImported: result.transactionsImported,
        duplicatesFound: result.duplicatesFound,
        warningsCount: result.warningsCount,
        errorsCount: result.errorsCount,
        logMessage: result.logMessage,
      },
    });

    return result;
  } catch (err: any) {
    const durationMs = Date.now() - startTime;

    await db.syncHistory.update({
      where: { id: historyRecord.id },
      data: {
        status: "Failed",
        completedAt: new Date(),
        durationMs,
        errorsCount: 1,
        logMessage: err.message || "Sync execution crashed.",
      },
    });

    throw err;
  }
}
