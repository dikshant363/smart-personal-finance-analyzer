import { prisma } from "@/lib/prisma";

export interface SplitResult {
  userId: string;
  amount: number;
}

export function calculateExpenseSplits(
  totalAmount: number,
  memberIds: string[],
  splitType: "Equal" | "Percentage" | "Custom",
  customPercentagesOrValues?: Record<string, number>
): SplitResult[] {
  if (memberIds.length === 0) return [];

  if (splitType === "Equal") {
    const splitVal = Math.round((totalAmount / memberIds.length) * 100) / 100;
    return memberIds.map((userId) => ({ userId, amount: splitVal }));
  }

  if (splitType === "Percentage") {
    const rates = customPercentagesOrValues || {};
    return memberIds.map((userId) => {
      const pct = rates[userId] || 0;
      return { userId, amount: Math.round((totalAmount * (pct / 100)) * 100) / 100 };
    });
  }

  // Custom split values direct
  const values = customPercentagesOrValues || {};
  return memberIds.map((userId) => ({
    userId,
    amount: values[userId] || 0,
  }));
}

export async function createHousehold(userId: string, name: string, db = prisma) {
  const profile = await db.householdProfile.create({
    data: {
      name,
      ownerId: userId,
    },
  });

  // Automatically add creator as owner member
  await db.householdMember.create({
    data: {
      householdId: profile.id,
      userId,
      role: "Adult",
    },
  });

  return profile;
}

export async function addHouseholdMember(
  householdId: string,
  userId: string,
  role: "Adult" | "Child" | "Guest",
  db = prisma
) {
  return db.householdMember.create({
    data: {
      householdId,
      userId,
      role,
    },
  });
}

export async function recordSharedExpense(
  householdId: string,
  transactionId: string,
  splitType: "Equal" | "Percentage" | "Custom",
  shares: SplitResult[],
  db = prisma
) {
  return db.expenseSplit.create({
    data: {
      householdId,
      transactionId,
      splitType,
      shares: JSON.stringify(shares),
      status: "Pending",
    },
  });
}

export async function settleExpense(splitId: string, db = prisma) {
  return db.expenseSplit.update({
    where: { id: splitId },
    data: { status: "Settled" },
  });
}
