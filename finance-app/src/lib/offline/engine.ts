import { prisma } from "@/lib/prisma";
import { TransactionType, TransactionSource } from "@prisma/client";

export interface SyncStats {
  syncedCount: number;
  duplicateCount: number;
  failedCount: number;
}

export async function queueOfflineAction(
  userId: string,
  action: string,
  payload: any,
  db = prisma
) {
  return db.offlineSyncQueue.create({
    data: {
      userId,
      action,
      payload: JSON.stringify(payload),
      status: "Pending",
    },
  });
}

export async function processOfflineSyncQueue(
  userId: string,
  db = prisma
): Promise<SyncStats> {
  const pending = await db.offlineSyncQueue.findMany({
    where: { userId, status: "Pending" },
    orderBy: { createdAt: "asc" },
  });

  let syncedCount = 0;
  let duplicateCount = 0;
  let failedCount = 0;

  for (const item of pending) {
    try {
      const payload = JSON.parse(item.payload);

      if (item.action === "CreateTransaction") {
        // Deduplicate check
        const amount = payload.amount || 0;
        const desc = payload.description || "Offline Transaction";
        const txType: TransactionType = payload.type === "Income" ? TransactionType.Income : TransactionType.Expense;
        const date = payload.date ? new Date(payload.date) : new Date();

        const duplicate = await db.transaction.findFirst({
          where: {
            userId,
            amount,
            description: desc,
            type: txType,
          },
        });

        if (duplicate) {
          duplicateCount++;
          syncedCount++;
          await db.offlineSyncQueue.update({
            where: { id: item.id },
            data: { status: "Synced" },
          });
          continue;
        }

        await db.transaction.create({
          data: {
            userId,
            amount,
            description: desc,
            type: txType,
            categoryId: payload.categoryId ?? null,
            date,
            source: TransactionSource.Manual,
          },
        });
      }

      await db.offlineSyncQueue.update({
        where: { id: item.id },
        data: { status: "Synced" },
      });
      syncedCount++;
    } catch (err) {
      console.error("Offline sync error on item", item.id, err);
      failedCount++;
      await db.offlineSyncQueue.update({
        where: { id: item.id },
        data: { status: "Failed" },
      });
    }
  }

  return {
    syncedCount,
    duplicateCount,
    failedCount,
  };
}
