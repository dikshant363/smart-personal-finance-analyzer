import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export type Db = typeof prisma;

export interface RecurringInput {
  name: string;
  categoryId?: string | null;
  type: "Income" | "Expense";
  frequency: string;
  amount: number;
  expectedNextDate: string | Date;
  lastPaidDate?: string | Date | null;
  status?: string;
  confidence?: number;
  isDetected?: boolean;
}

function mapRecurring(item: any) {
  return {
    ...item,
    amount: toNumber(item.amount),
  };
}

export async function listRecurringItems(userId: string, db: Db = prisma) {
  const items = await db.recurringItem.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { expectedNextDate: "asc" },
  });
  return items.map(mapRecurring);
}

export async function getRecurringItem(userId: string, id: string, db: Db = prisma) {
  const item = await db.recurringItem.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!item || item.userId !== userId) return null;
  return mapRecurring(item);
}

export async function createRecurringItem(userId: string, data: RecurringInput, db: Db = prisma) {
  const created = await db.recurringItem.create({
    data: {
      userId,
      name: data.name,
      categoryId: data.categoryId ?? null,
      type: data.type,
      frequency: data.frequency,
      amount: data.amount,
      expectedNextDate: new Date(data.expectedNextDate),
      lastPaidDate: data.lastPaidDate ? new Date(data.lastPaidDate) : null,
      status: data.status ?? "Active",
      confidence: data.confidence ?? 1.0,
      isDetected: data.isDetected ?? false,
    },
    include: { category: true },
  });
  return mapRecurring(created);
}

export async function updateRecurringItem(
  userId: string,
  id: string,
  data: Partial<RecurringInput>,
  db: Db = prisma
) {
  const existing = await db.recurringItem.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return null;

  const updated = await db.recurringItem.update({
    where: { id },
    data: {
      name: data.name,
      categoryId: data.categoryId !== undefined ? data.categoryId : undefined,
      type: data.type,
      frequency: data.frequency,
      amount: data.amount,
      expectedNextDate: data.expectedNextDate ? new Date(data.expectedNextDate) : undefined,
      lastPaidDate: data.lastPaidDate !== undefined ? (data.lastPaidDate ? new Date(data.lastPaidDate) : null) : undefined,
      status: data.status,
      confidence: data.confidence,
      isDetected: data.isDetected,
    },
    include: { category: true },
  });

  return mapRecurring(updated);
}

export async function deleteRecurringItem(userId: string, id: string, db: Db = prisma) {
  const existing = await db.recurringItem.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return false;

  await db.recurringItem.delete({ where: { id } });
  return true;
}

// Notification Candidate methods
export async function createNotificationCandidate(
  userId: string,
  data: { title: string; body: string; sendAt: Date; type: string },
  db: Db = prisma
) {
  return db.notificationCandidate.create({
    data: {
      userId,
      title: data.title,
      body: data.body,
      sendAt: data.sendAt,
      type: data.type,
    },
  });
}

export async function listNotificationCandidates(userId: string, status?: string, db: Db = prisma) {
  return db.notificationCandidate.findMany({
    where: {
      userId,
      status: status ?? undefined,
    },
    orderBy: { sendAt: "asc" },
  });
}
