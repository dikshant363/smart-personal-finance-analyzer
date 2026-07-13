import { prisma } from "@/lib/prisma";

export function maskPersonalData(input: string): string {
  // Simple regex for email masking
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  // Simple regex for phone numbers
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;

  return input
    .replace(emailRegex, "[MASKED_EMAIL]")
    .replace(phoneRegex, "[MASKED_PHONE]");
}

export async function generateDataExportPayload(userId: string, db = prisma): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  const transactions = await db.transaction.findMany({
    where: { userId },
  });

  const payload = {
    exportDate: new Date().toISOString(),
    userId,
    profile: user ? { name: user.name, email: user.email, locale: user.profile?.locale } : null,
    transactions: transactions.map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      type: t.type,
      category: t.categoryId,
      date: t.date.toISOString(),
    })),
  };

  return JSON.stringify(payload, null, 2);
}
