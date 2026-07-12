import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  listRecurringItems,
  getRecurringAnalytics,
  generateRecurringOptimizations,
  getRecurringForecast,
  detectRecurringTransactions
} from "@/lib/recurring";
import { RecurringClient } from "@/components/recurring/recurring-client";

export default async function RecurringPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [items, analytics, optimizations, forecast, detected, categories, profile] = await Promise.all([
    listRecurringItems(user.id),
    getRecurringAnalytics(user.id),
    generateRecurringOptimizations(user.id),
    getRecurringForecast(user.id),
    detectRecurringTransactions(user.id),
    prisma.category.findMany({ where: { userId: user.id } }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const currency = profile?.currency ?? "USD";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Recurring Commitments & Subscriptions</h1>
      <RecurringClient
        initialItems={items}
        initialAnalytics={analytics}
        initialOptimizations={optimizations}
        forecast={forecast}
        initialDetected={detected}
        categories={categories}
        currency={currency}
      />
    </div>
  );
}
