import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateHealthScore, getScoreTrend } from "@/lib/score/engine";
import { saveMonthlySnapshot, getHistory } from "@/lib/score/store";
import { ScoreBreakdown } from "@/components/score/score-breakdown";

export default async function ScorePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const result = await calculateHealthScore(user.id);
  await saveMonthlySnapshot(user.id, result);
  const history = await getHistory(user.id);
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const currency = profile?.currency ?? "USD";
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Financial Health Score</h1>
      <ScoreBreakdown result={result} history={history} currency={currency} />
    </div>
  );
}
