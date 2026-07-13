import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUnifiedTimeline, generatePlanningSuggestions } from "@/lib/timeline";
import { TimelineClient } from "@/components/timeline/TimelineClient";

export default async function TimelinePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const [events, profile] = await Promise.all([
    getUnifiedTimeline(user.id, start, end),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  const suggestions = generatePlanningSuggestions(events);
  const currency = profile?.currency ?? "USD";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Financial Timeline & Planning</h1>
      <TimelineClient
        initialEvents={events}
        initialSuggestions={suggestions}
        currency={currency}
      />
    </div>
  );
}
