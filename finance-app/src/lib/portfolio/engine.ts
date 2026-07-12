import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export interface PortfolioSummary {
  portfolioId: string;
  name: string;
  description: string | null;
  totalBalance: number;
  accountsCount: number;
}

export interface AccountTransferResult {
  fromAccountName: string;
  toAccountName: string;
  amount: number;
  newFromBalance: number;
  newToBalance: number;
}

export async function getPortfoliosSummary(
  userId: string,
  db = prisma
): Promise<PortfolioSummary[]> {
  const portfolios = await db.portfolio.findMany({
    where: { userId },
    include: { accounts: { where: { status: "Active" } } },
  });

  return portfolios.map((p) => {
    const totalBalance = p.accounts.reduce(
      (sum, acc) => sum + toNumber(acc.currentBalance),
      0
    );

    return {
      portfolioId: p.id,
      name: p.name,
      description: p.description,
      totalBalance,
      accountsCount: p.accounts.length,
    };
  });
}

export async function createAccountTransfer(
  userId: string,
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  db = prisma
): Promise<AccountTransferResult> {
  return db.$transaction(async (tx) => {
    const fromAcc = await tx.account.findUnique({ where: { id: fromAccountId } });
    const toAcc = await tx.account.findUnique({ where: { id: toAccountId } });

    if (!fromAcc || fromAcc.userId !== userId) throw new Error("Source account not found");
    if (!toAcc || toAcc.userId !== userId) throw new Error("Destination account not found");

    const fromBal = toNumber(fromAcc.currentBalance);
    const toBal = toNumber(toAcc.currentBalance);

    if (fromBal < amount) {
      throw new Error(`Insufficient funds in source account '${fromAcc.name}'. Available: ${fromBal}`);
    }

    const updatedFrom = await tx.account.update({
      where: { id: fromAccountId },
      data: { currentBalance: fromBal - amount },
    });

    const updatedTo = await tx.account.update({
      where: { id: toAccountId },
      data: { currentBalance: toBal + amount },
    });

    // Optionally create a manual ledger record for audit trails
    await tx.transaction.create({
      data: {
        userId,
        type: "Expense",
        amount,
        currency: fromAcc.currency,
        description: `Transfer out to ${toAcc.name}`,
        source: "Manual",
      },
    });

    await tx.transaction.create({
      data: {
        userId,
        type: "Income",
        amount,
        currency: toAcc.currency,
        description: `Transfer in from ${fromAcc.name}`,
        source: "Manual",
      },
    });

    return {
      fromAccountName: fromAcc.name,
      toAccountName: toAcc.name,
      amount,
      newFromBalance: toNumber(updatedFrom.currentBalance),
      newToBalance: toNumber(updatedTo.currentBalance),
    };
  });
}

export interface PortfolioDistribution {
  accountName: string;
  type: string;
  balance: number;
  percentage: number;
}

export async function getPortfolioDistribution(
  userId: string,
  portfolioId: string,
  db = prisma
): Promise<PortfolioDistribution[]> {
  const accounts = await db.account.findMany({
    where: { userId, portfolioId, status: "Active" },
  });

  const total = accounts.reduce((sum, acc) => sum + toNumber(acc.currentBalance), 0);
  if (total === 0) return [];

  return accounts.map((acc) => ({
    accountName: acc.name,
    type: acc.type,
    balance: toNumber(acc.currentBalance),
    percentage: Math.round((toNumber(acc.currentBalance) / total) * 100),
  }));
}
