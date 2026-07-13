import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listProcessedDocuments } from "@/lib/receipts/repository";
import { DocumentClient } from "@/components/receipts/DocumentClient";

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [documents, categories, profile] = await Promise.all([
    listProcessedDocuments(user.id),
    prisma.category.findMany({ where: { userId: user.id } }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const currency = profile?.currency ?? "USD";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Document Intelligence & Receipt Scanner</h1>
      <DocumentClient
        initialDocuments={documents}
        categories={categories}
        currency={currency}
      />
    </div>
  );
}
