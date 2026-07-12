import { prisma } from "@/lib/prisma";
import { submitAiFeedback, dismissAiInsight } from "./repository";
import type { InsightFeedback, Db } from "./types";

export async function submitFeedback(insightId: string, userId: string, feedback: InsightFeedback, db: Db = prisma): Promise<void> {
  return submitAiFeedback(insightId, userId, feedback, db);
}

export async function dismissInsight(insightId: string, userId: string, db: Db = prisma): Promise<void> {
  return dismissAiInsight(insightId, userId, db);
}
