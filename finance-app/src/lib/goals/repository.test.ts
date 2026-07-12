import { describe, it, expect } from "vitest";
import {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  computeGoalProgress,
} from "./repository";
import type { GoalRow } from "./repository";

type Goal = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline: Date | null;
  priority: string;
  status: string;
};

function createDb() {
  const goals: GoalRow[] = [];

  return {
    goal: {
      findMany(args: any): GoalRow[] {
        let rows = goals;
        if (args.where?.userId) {
          rows = rows.filter((g) => g.userId === args.where.userId);
        }
        if (args.where?.status) {
          rows = rows.filter((g) => g.status === args.where.status);
        }
        if (args.orderBy?.createdAt === "desc") {
          rows = [...rows].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          );
        }
        return rows;
      },
      findUnique(args: any): GoalRow | null {
        return goals.find((g) => g.id === args.where.id) ?? null;
      },
      create(args: any): GoalRow {
        const created: GoalRow = {
          id: `g-${Date.now()}`,
          userId: args.data.userId,
          name: args.data.name,
          description: args.data.description ?? null,
          targetAmount: args.data.targetAmount,
          currentAmount: args.data.currentAmount,
          currency: args.data.currency ?? "USD",
          deadline: args.data.deadline ? new Date(args.data.deadline) : null,
          priority: args.data.priority ?? "medium",
          status: args.data.status ?? "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        goals.push(created);
        return created;
      },
      update(args: any): GoalRow {
        const idx = goals.findIndex((g) => g.id === args.where.id);
        const existing = goals[idx];
        const updated: GoalRow = {
          ...existing,
          name: args.data.name ?? existing.name,
          description:
            args.data.description !== undefined
              ? args.data.description
              : existing.description,
          targetAmount: args.data.targetAmount ?? existing.targetAmount,
          currentAmount: args.data.currentAmount ?? existing.currentAmount,
          currency: args.data.currency ?? existing.currency,
          deadline: args.data.deadline
            ? new Date(args.data.deadline)
            : existing.deadline,
          priority: args.data.priority ?? existing.priority,
          status: args.data.status ?? existing.status,
          updatedAt: new Date(),
        };
        goals[idx] = updated;
        return updated;
      },
      delete(args: any): GoalRow {
        const idx = goals.findIndex((g) => g.id === args.where.id);
        const [deleted] = goals.splice(idx, 1);
        return deleted;
      },
    },
  };
}

describe("goal repository", () => {
  it("computes goal progress", () => {
    expect(computeGoalProgress({ currentAmount: 0, targetAmount: 100 })).toBe(0);
    expect(computeGoalProgress({ currentAmount: 50, targetAmount: 100 })).toBe(50);
    expect(computeGoalProgress({ currentAmount: 120, targetAmount: 100 })).toBe(100);
  });

  it("CRUD operations with userId scoping", async () => {
    const userId = "u1";
    const db = createDb();

    const created = await createGoal(userId, {
      name: "Emergency Fund",
      targetAmount: 10000,
      currentAmount: 2500,
      currency: "USD",
      priority: "high",
      status: "active",
    }, db as any);
    expect(created.name).toBe("Emergency Fund");
    expect(created.progress).toBe(25);

    const all = await listGoals(userId, undefined, db as any);
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(created.id);

    const active = await listGoals(userId, "active", db as any);
    expect(active).toHaveLength(1);

    const archived = await listGoals(userId, "archived", db as any);
    expect(archived).toHaveLength(0);

    const fetched = await getGoal(userId, created.id, db as any);
    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(created.id);

    const updated = await updateGoal(
      userId,
      created.id,
      {
        currentAmount: 5000,
        status: "completed",
      },
      db as any
    );
    expect(updated!.progress).toBe(50);
    expect(updated!.status).toBe("completed");

    const completed = await listGoals(userId, "completed", db as any);
    expect(completed).toHaveLength(1);

    const removed = await deleteGoal(userId, created.id, db as any);
    expect(removed).toBe(true);

    const afterDelete = await listGoals(userId, undefined, db as any);
    expect(afterDelete).toHaveLength(0);
  });

  it("getGoal returns null for non-existent or foreign goal", async () => {
    const foreignUserId = "u2";
    const db = createDb();

    const foreign = await createGoal(
      foreignUserId,
      {
        name: "Other",
        targetAmount: 100,
        currency: "USD",
      },
      db as any
    );

    const own = await getGoal("u1", foreign.id, db as any);
    expect(own).toBeNull();
  });
});
