import { prisma } from "@/lib/prisma";

export interface BankInstitution {
  id: string;
  name: string;
  supportedTypes: string[];
}

export const SUPPORTED_INSTITUTIONS: BankInstitution[] = [
  { id: "inst_chase", name: "Chase Bank", supportedTypes: ["Checking", "Savings", "CreditCard"] },
  { id: "inst_boa", name: "Bank of America", supportedTypes: ["Checking", "Savings"] },
  { id: "inst_wells", name: "Wells Fargo", supportedTypes: ["Checking", "Savings", "Loans"] },
  { id: "inst_fidelity", name: "Fidelity Investments", supportedTypes: ["Brokerage"] },
];

export async function connectBankingInstitution(
  userId: string,
  institutionId: string,
  publicToken: string,
  db = prisma
) {
  const inst = SUPPORTED_INSTITUTIONS.find(i => i.id === institutionId);
  if (!inst) {
    throw new Error(`Institution "${institutionId}" is not supported.`);
  }

  // exchange mock publicToken for accessToken
  const accessToken = `access_token_mock_${publicToken}`;

  return db.bankConnection.create({
    data: {
      userId,
      institutionId,
      institutionName: inst.name,
      accessToken,
      status: "Connected",
    },
  });
}

export async function getBankConnections(userId: string, db = prisma) {
  return db.bankConnection.findMany({
    where: { userId },
  });
}

export async function disconnectBanking(connectionId: string, db = prisma) {
  return db.bankConnection.delete({
    where: { id: connectionId },
  });
}

export async function syncBankConnectionData(connectionId: string, db = prisma): Promise<number> {
  const connection = await db.bankConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new Error(`Bank connection "${connectionId}" not found.`);
  }

  // Mock syncing accounts & transaction data from connected external provider API
  // In a real environment, we'd invoke the provider API (e.g. Plaid) using the accessToken,
  // fetch transactions, and upsert them into the DB.
  
  // Update lastSynced timestamp
  await db.bankConnection.update({
    where: { id: connectionId },
    data: { lastSynced: new Date(), status: "Connected" },
  });

  return 15; // mock count of synced transactions
}
