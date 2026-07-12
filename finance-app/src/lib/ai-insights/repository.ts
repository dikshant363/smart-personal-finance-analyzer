import { prisma } from "@/lib/prisma";
import type { AiInsight, Db } from "./types";

export async function saveAiInsight(insight: AiInsight, db: Db = prisma): Promise<AiInsight> {
  const row = await db.aiInsight.create({
    data: {
      userId: insight.userId,
      type: insight.type,
      title: insight.title,
      summary: insight.summary,
      detail: insight.detail,
      contextVersion: insight.contextVersion,
      promptVersion: insight.promptVersion,
      confidence: insight.confidence,
      feedback: insight.feedback ?? undefined,
      dismissed: insight.dismissed,
      generatedAt: new Date(insight.generatedAt),
    },
  });

  return {
    ...insight,
    id: row.id,
    generatedAt: row.generatedAt.toISOString(),
  };
}

export async function getAiInsightFeed(userId: string, db: Db = prisma): Promise<AiInsight[]> {
  const rows = await db.aiInsight.findMany({
    where: { userId, dismissed: false },
    orderBy: { generatedAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    type: row.type as AiInsight["type"],
    title: row.title,
    summary: row.summary,
    detail: row.detail,
    contextVersion: row.contextVersion,
    promptVersion: row.promptVersion,
    confidence: row.confidence,
    feedback: row.feedback as AiInsight["feedback"],
    dismissed: row.dismissed,
    generatedAt: row.generatedAt.toISOString(),
  }));
}

export async function submitAiFeedback(insightId: string, userId: string, feedback: AiInsight["feedback"], db: Db = prisma): Promise<void> {
  const row = await db.aiInsight.findUnique({ where: { id: insightId } });
  if (!row || row.userId !== userId) {
    throw new Error("Insight not found");
  }

  await db.aiInsight.update({
    where: { id: insightId },
    data: { feedback: feedback ?? undefined },
  });
}

export async function dismissAiInsight(insightId: string, userId: string, db: Db = prisma): Promise<void> {
  const row = await db.aiInsight.findUnique({ where: { id: insightId } });
  if (!row || row.userId !== userId) {
    throw new Error("Insight not found");
  }

  await db.aiInsight.update({
    where: { id: insightId },
    data: { dismissed: true },
  });
}

export async function getAiInsightStats(userId: string, db: Db = prisma): Promise<{ total: number; helpful: number; notHelpful: number; dismissed: number }> {
  const [total, helpful, notHelpful, dismissed] = await Promise.all([
    db.aiInsight.count({ where: { userId } }),
    db.aiInsight.count({ where: { userId, feedback: "helpful" } }),
    db.aiInsight.count({ where: { userId, feedback: "not_helpful" } }),
    db.aiInsight.count({ where: { userId, dismissed: true } }),
  ]);

  return { total, helpful, notHelpful, dismissed };
}
