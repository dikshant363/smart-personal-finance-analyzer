import { prisma } from "@/lib/prisma";
import { listRecurringItems, createNotificationCandidate } from "./repository";
import { toNumber } from "@/lib/currency";

export type Db = typeof prisma;

export interface UpcomingPayment {
  recurringItemId: string;
  name: string;
  categoryName: string;
  type: "Income" | "Expense";
  amount: number;
  dueDate: Date;
  frequency: string;
  status: "Pending" | "Overdue" | "Paid";
}

export async function getUpcomingPayments(
  userId: string,
  start: Date,
  end: Date,
  db: Db = prisma
): Promise<UpcomingPayment[]> {
  const recurring = await listRecurringItems(userId, db);
  const upcoming: UpcomingPayment[] = [];

  for (const item of recurring) {
    if (item.status === "Paused" || item.status === "Cancelled") continue;

    let current = new Date(item.expectedNextDate);

    // Project occurrences between start and end date
    while (current.getTime() <= end.getTime()) {
      if (current.getTime() >= start.getTime()) {
        const nowTime = new Date().getTime();
        let status: UpcomingPayment["status"] = "Pending";

        if (item.lastPaidDate && new Date(item.lastPaidDate).getTime() >= current.getTime() - 2 * 86400000) {
          status = "Paid";
        } else if (current.getTime() < nowTime) {
          status = "Overdue";
        }

        upcoming.push({
          recurringItemId: item.id,
          name: item.name,
          categoryName: item.category?.name || "Uncategorized",
          type: item.type as "Income" | "Expense",
          amount: toNumber(item.amount),
          dueDate: new Date(current),
          frequency: item.frequency,
          status,
        });
      }

      // Increment date based on frequency
      if (item.frequency === "Weekly") current.setDate(current.getDate() + 7);
      else if (item.frequency === "Biweekly") current.setDate(current.getDate() + 14);
      else if (item.frequency === "Monthly") current.setMonth(current.getMonth() + 1);
      else if (item.frequency === "Quarterly") current.setMonth(current.getMonth() + 3);
      else if (item.frequency === "Annual") current.setFullYear(current.getFullYear() + 1);
      else if (item.frequency === "Daily") current.setDate(current.getDate() + 1);
      else break; // custom/unknown frequency
    }
  }

  return upcoming.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

export async function checkAndGenerateReminders(
  userId: string,
  db: Db = prisma
): Promise<number> {
  const recurring = await listRecurringItems(userId, db);
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  let generatedCount = 0;

  for (const item of recurring) {
    if (item.status !== "Active" || item.type !== "Expense") continue;

    const nextDate = new Date(item.expectedNextDate);

    // Check if next payment is within 3 days and we haven't logged a notification candidate for this cycle yet
    if (nextDate.getTime() >= now.getTime() && nextDate.getTime() <= threeDaysFromNow.getTime()) {
      const title = `Upcoming Bill: ${item.name}`;
      const body = `Your recurring payment of ${item.currency} ${toNumber(item.amount)} for ${item.name} is due on ${nextDate.toLocaleDateString()}.`;

      // Check if we already have a pending/sent notification candidate for this item close to this date
      const existing = await db.notificationCandidate.findFirst({
        where: {
          userId,
          type: "recurring_payment_reminder",
          title,
          sendAt: {
            gte: new Date(nextDate.getTime() - 2 * 86400000),
            lte: new Date(nextDate.getTime() + 2 * 86400000),
          },
        },
      });

      if (!existing) {
        await createNotificationCandidate(userId, {
          title,
          body,
          sendAt: new Date(nextDate.getTime() - 86400000), // send 1 day before
          type: "recurring_payment_reminder",
        }, db);
        generatedCount++;
      }
    }
  }

  return generatedCount;
}
