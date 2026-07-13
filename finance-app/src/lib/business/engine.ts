import { prisma } from "@/lib/prisma";

export interface BusinessPLStatement {
  revenue: number;
  expenses: Record<string, number>;
  netProfit: number;
}

export function computeBusinessPL(
  paidInvoicesAmount: number,
  expenses: { category: string; amount: number }[]
): BusinessPLStatement {
  const expenseMap: Record<string, number> = {};
  let totalExpenses = 0;

  for (const exp of expenses) {
    expenseMap[exp.category] = (expenseMap[exp.category] || 0) + exp.amount;
    totalExpenses += exp.amount;
  }

  return {
    revenue: paidInvoicesAmount,
    expenses: expenseMap,
    netProfit: paidInvoicesAmount - totalExpenses,
  };
}

export async function createBusinessProfile(
  userId: string,
  name: string,
  businessType: string,
  db = prisma
) {
  return db.businessProfile.create({
    data: {
      userId,
      name,
      businessType,
    },
  });
}

export async function createBusinessClient(
  businessId: string,
  name: string,
  email?: string,
  notes?: string,
  db = prisma
) {
  return db.businessClient.create({
    data: {
      businessId,
      name,
      email,
      notes,
    },
  });
}

export async function createBusinessInvoice(
  businessId: string,
  clientId: string,
  amount: number,
  dueDate: Date,
  db = prisma
) {
  return db.businessInvoice.create({
    data: {
      businessId,
      clientId,
      amount,
      dueDate,
      status: "Draft",
    },
  });
}

export async function markInvoicePaid(invoiceId: string, db = prisma) {
  return db.businessInvoice.update({
    where: { id: invoiceId },
    data: { status: "Paid" },
  });
}
