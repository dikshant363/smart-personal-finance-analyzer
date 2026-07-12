import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";
import { calculateHealthScore } from "@/lib/score/engine";
import { analyzeSpending } from "@/lib/analysis/analyze";
import { generateRuleRecommendations } from "./rules";
import { enhanceRecommendation } from "./ai";
import {
  type RuleRecommendation,
  type StoredRecommendation,
  type RecFilters,
  type RecSort,
  type RecStatus,
  PRIORITY_RANK,
} from "./types";

export type Db = typeof prisma;

function mapRow(row: any): StoredRecommendation {
  return {
    id: row.id,
    userId: row.userId,
    key: row.key,
    category: row.category as StoredRecommendation["category"],
    title: row.title,
    summary: row.summary,
    explanation: row.explanation,
    reason: row.reason,
    evidence: row.evidence,
    monthlySavings: toNumber(row.monthlySavings),
    annualSavings: toNumber(row.annualSavings),
    scoreImpact: row.scoreImpact,
    difficulty: row.difficulty as StoredRecommendation["difficulty"],
    priority: row.priority as StoredRecommendation["priority"],
    confidence: row.confidence as StoredRecommendation["confidence"],
    action: row.action,
    status: row.status as StoredRecommendation["status"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : undefined,
    acceptedAt: row.acceptedAt ? row.acceptedAt.toISOString() : null,
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
  };
}

export async function regenerateRecommendations(
  userId: string,
  db: Db = prisma
): Promise<StoredRecommendation[]> {
  const score = await calculateHealthScore(userId, db);
  const analysis = await analyzeSpending(userId, db);

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const grouped = await db.transaction.groupBy({
    by: ["type"],
    where: { userId, date: { gte: firstOfMonth, lte: now } },
    _sum: { amount: true },
  });

  const monthlyIncome = toNumber(
    grouped.find((g) => g.type === "Income")?._sum.amount
  );
  const monthlyExpense = toNumber(
    grouped.find((g) => g.type === "Expense")?._sum.amount
  );

  const rules = generateRuleRecommendations({
    score,
    analysis,
    monthlyIncome,
    monthlyExpense,
    currency: score.currency,
  });

  const priorityOrder = [...rules].sort((a, b) => {
    const pa = PRIORITY_RANK[a.priority] ?? 99;
    const pb = PRIORITY_RANK[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;
    return (b.scoreImpact ?? 0) - (a.scoreImpact ?? 0);
  });

  const enhanceSet = new Set(
    priorityOrder.slice(0, 6).map((r) => r.key)
  );

  const newKeys: string[] = [];
  const stored: StoredRecommendation[] = [];

  for (const rule of rules) {
    newKeys.push(rule.key);

    const existing = await db.recommendation.findUnique({
      where: { userId_key: { userId, key: rule.key } },
    });

    const explanation = enhanceSet.has(rule.key)
      ? await enhanceRecommendation(rule, score.currency)
      : `${rule.summary} ${rule.reason}`;

    const rec = await db.recommendation.upsert({
      where: { userId_key: { userId, key: rule.key } },
      create: {
        userId,
        key: rule.key,
        category: rule.category,
        title: rule.title,
        summary: rule.summary,
        explanation,
        reason: rule.reason,
        evidence: rule.evidence,
        monthlySavings: rule.monthlySavings,
        annualSavings: rule.annualSavings,
        scoreImpact: rule.scoreImpact,
        difficulty: rule.difficulty,
        priority: rule.priority,
        confidence: rule.confidence,
        action: rule.action,
        status: existing?.status ?? "active",
        expiresAt: rule.expiresAt ? new Date(rule.expiresAt) : null,
      },
      update: {
        category: rule.category,
        title: rule.title,
        summary: rule.summary,
        explanation,
        reason: rule.reason,
        evidence: rule.evidence,
        monthlySavings: rule.monthlySavings,
        annualSavings: rule.annualSavings,
        scoreImpact: rule.scoreImpact,
        difficulty: rule.difficulty,
        priority: rule.priority,
        confidence: rule.confidence,
        action: rule.action,
        expiresAt: rule.expiresAt ? new Date(rule.expiresAt) : null,
        updatedAt: new Date(),
      },
    });

    stored.push(mapRow(rec));
  }

  await db.recommendation.updateMany({
    where: {
      userId,
      status: "active",
      key: { notIn: newKeys },
    },
    data: { status: "archived" },
  });

  return listRecommendations(userId, { status: "active" }, "priority", db);
}

export async function listRecommendations(
  userId: string,
  filters: RecFilters = {},
  sort: RecSort = "priority",
  db: Db = prisma
): Promise<StoredRecommendation[]> {
  const rows = await db.recommendation.findMany({
    where: {
      userId,
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(typeof filters.minSavings === "number"
        ? { monthlySavings: { gte: filters.minSavings } }
        : {}),
    },
    orderBy:
      sort === "priority"
        ? { priority: "asc" }
        : sort === "savings"
          ? { monthlySavings: "desc" }
          : sort === "scoreImpact"
            ? { scoreImpact: "desc" }
            : sort === "newest"
              ? { createdAt: "desc" }
              : { createdAt: "asc" },
  });

  return rows.map(mapRow);
}

export async function setRecommendationStatus(
  userId: string,
  id: string,
  status: RecStatus,
  db: Db = prisma
): Promise<StoredRecommendation | null> {
  const rec = await db.recommendation.findUnique({ where: { id } });
  if (!rec || rec.userId !== userId) return null;

  const updated = await db.recommendation.update({
    where: { id },
    data: {
      status,
      acceptedAt: status === "accepted" ? new Date() : undefined,
      completedAt: status === "completed" ? new Date() : undefined,
    },
  });

  return mapRow(updated);
}
