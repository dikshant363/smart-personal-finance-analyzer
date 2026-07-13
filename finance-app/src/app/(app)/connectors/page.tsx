import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConnectorClient } from "@/features/connector/ConnectorClient";

export default async function ConnectorsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [history, accounts, profile] = await Promise.all([
    prisma.syncHistory.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 15,
    }),
    prisma.account.findMany({
      where: { userId: user.id, status: "Active" },
    }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const currency = profile?.currency ?? "USD";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Financial Connectivity Hub</h1>
      <ConnectorClient
        initialHistory={history}
        connectedAccountsCount={accounts.length}
        currency={currency}
      />
    </div>
  );
}
