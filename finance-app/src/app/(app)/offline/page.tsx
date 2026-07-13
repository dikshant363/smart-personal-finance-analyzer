import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OfflineClient } from "@/components/offline/OfflineClient";

export default async function OfflinePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const queue = await prisma.offlineSyncQueue.findMany({
    where: { userId: user.id, status: "Pending" },
    orderBy: { createdAt: "asc" },
  });

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Platform Experience & Offline Intelligence</h1>
      <OfflineClient
        initialQueue={queue}
        categories={categories}
      />
    </div>
  );
}
