import { describe, it, expect } from "vitest";
import {
  regenerateRecommendations,
  listRecommendations,
  setRecommendationStatus,
} from "./repository";

type FakeRow = {
  id: string;
  userId: string;
  key: string;
  category: string;
  title: string;
  summary: string;
  explanation: string;
  reason: string;
  evidence: string;
  monthlySavings: number;
  annualSavings: number;
  scoreImpact: number;
  difficulty: string;
  priority: string;
  confidence: string;
  action: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
  acceptedAt: Date | null;
  completedAt: Date | null;
};

function inRange(date: Date, gte?: Date, lte?: Date): boolean {
  if (gte && date < gte) return false;
  if (lte && date > lte) return false;
  return true;
}

function createDb() {
  const now = new Date();
  const recs: FakeRow[] = [];

  const txns = [
    { id: "t1", type: "Income", amount: 1000, date: new Date(2026, 6, 5), categoryId: null as string | null, categoryName: null as string | null },
    { id: "t2", type: "Expense", amount: 3000, date: new Date(2026, 6, 3), categoryId: "c1", categoryName: "Rent" },
    { id: "t3", type: "Expense", amount: 200, date: new Date(2026, 6, 8), categoryId: "c2", categoryName: "Groceries" },
  ].map((t) => ({ ...t, userId: "u1" }));

  const categories = [
    { id: "c1", name: "Rent" },
    { id: "c2", name: "Groceries" },
  ];
  const budgets = [{ id: "b1", name: "Rent", amount: 2500, categoryId: "c1" }];
  const profile = { currency: "USD" };

  const transaction = {
    groupBy(args: any) {
      const by = args.by[0];
      if (by === "type") {
        const groups = new Map<string, number>();
        for (const t of txns) {
          if (t.userId !== args.where.userId) continue;
          if (args.where.type && t.type !== args.where.type) continue;
          if (!inRange(t.date, args.where.date?.gte, args.where.date?.lte)) continue;
          groups.set(t.type, (groups.get(t.type) ?? 0) + t.amount);
        }
        return [...groups.entries()].map(([type, amount]) => ({ type, _sum: { amount } }));
      }
      if (by === "categoryId") {
        const groups = new Map<string, number>();
        for (const t of txns) {
          if (t.userId !== args.where.userId) continue;
          if (t.type !== "Expense") continue;
          if (!inRange(t.date, args.where.date?.gte, args.where.date?.lte)) continue;
          groups.set(t.categoryId ?? "", (groups.get(t.categoryId ?? "") ?? 0) + t.amount);
        }
        return [...groups.entries()].map(([categoryId, amount]) => ({ categoryId, _sum: { amount } }));
      }
      return [];
    },
    findMany(args: any) {
      if (args.include?.category) {
        return txns
          .filter(
            (t) =>
              t.userId === args.where.userId &&
              t.type === "Expense" &&
              inRange(t.date, args.where.date?.gte, args.where.date?.lte)
          )
          .map((t) => ({ amount: t.amount, category: { name: t.categoryName }, date: t.date }));
      }
      if (args.select && "type" in args.select) {
        return txns
          .filter((t) => t.userId === args.where.userId && inRange(t.date, args.where.date?.gte))
          .map((t) => ({ amount: t.amount, date: t.date, type: t.type, categoryId: t.categoryId }));
      }
      if (args.select?.amount) {
        return txns
          .filter(
            (t) =>
              t.userId === args.where.userId &&
              t.type === "Income" &&
              inRange(t.date, args.where.date?.gte, args.where.date?.lte)
          )
          .map((t) => ({ amount: t.amount }));
      }
      if (args.select?.date) {
        return txns
          .filter((t) => t.userId === args.where.userId && inRange(t.date, args.where.date?.gte, args.where.date?.lte))
          .map((t) => ({ date: t.date }));
      }
      return [];
    },
    aggregate(args: any) {
      let sum = 0;
      for (const t of txns) {
        if (t.userId !== args.where.userId) continue;
        if (args.where.type && t.type !== args.where.type) continue;
        if (args.where.categoryId && t.categoryId !== args.where.categoryId) continue;
        if (!inRange(t.date, args.where.date?.gte, args.where.date?.lte)) continue;
        sum += t.amount;
      }
      return { _sum: { amount: sum } };
    },
  };

  const recommendation = {
    findUnique(args: any): FakeRow | null {
      if (args.where.id) return recs.find((r) => r.id === args.where.id) ?? null;
      if (args.where.userId_key) {
        return (
          recs.find(
            (r) => r.userId === args.where.userId_key.userId && r.key === args.where.userId_key.key
          ) ?? null
        );
      }
      return null;
    },
    upsert(args: any): FakeRow {
      const { userId, key } = args.where.userId_key;
      const idx = recs.findIndex((r) => r.userId === userId && r.key === key);
      if (idx >= 0) {
        const updated: FakeRow = { ...recs[idx], ...args.update, updatedAt: new Date(), id: recs[idx].id };
        recs[idx] = updated;
        return updated;
      }
      const created: FakeRow = {
        ...args.create,
        id: `r-${key}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: args.create.expiresAt ?? null,
        acceptedAt: null,
        completedAt: null,
      };
      recs.push(created);
      return created;
    },
    updateMany(args: any): { count: number } {
      let count = 0;
      for (const r of recs) {
        if (r.userId !== args.where.userId) continue;
        if (args.where.status && r.status !== args.where.status) continue;
        if (Array.isArray(args.where.key?.notIn) && args.where.key.notIn.includes(r.key)) continue;
        r.status = args.data.status;
        count++;
      }
      return { count };
    },
    update(args: any): FakeRow {
      const idx = recs.findIndex((r) => r.id === args.where.id);
      const updated: FakeRow = { ...recs[idx], ...args.data, updatedAt: new Date() };
      recs[idx] = updated;
      return updated;
    },
    findMany(args: any): FakeRow[] {
      return recs.filter((r) => {
        if (r.userId !== args.where?.userId) return false;
        if (args.where?.status && r.status !== args.where.status) return false;
        if (args.where?.priority && r.priority !== args.where.priority) return false;
        if (args.where?.category && r.category !== args.where.category) return false;
        if (args.where?.difficulty && r.difficulty !== args.where.difficulty) return false;
        if (typeof args.where?.monthlySavings?.gte === "number" && r.monthlySavings < args.where.monthlySavings.gte)
          return false;
        return true;
      });
    },
  };

  return {
    transaction,
    category: { findMany: () => categories },
    budget: { findMany: () => budgets },
    profile: { findUnique: () => profile },
    scoreHistory: { findFirst: () => null },
    recommendation,
  };
}

describe("recommendation repository", () => {
  it("regenerates, lists and updates recommendation status", async () => {
    const db = createDb() as any;
    const userId = "u1";

    const regenerated = await regenerateRecommendations(userId, db);
    expect(Array.isArray(regenerated)).toBe(true);
    expect(regenerated.length).toBeGreaterThan(0);
    for (const r of regenerated) {
      expect(typeof r.id).toBe("string");
      expect(typeof r.status).toBe("string");
    }

    const list = await listRecommendations(userId, {}, "priority", db);
    expect(Array.isArray(list)).toBe(true);

    const id = regenerated[0].id;
    const updated = await setRecommendationStatus(userId, id, "accepted", db);
    expect(updated).not.toBeNull();
    expect(updated!.status).toBe("accepted");
  });
});
