import { json, error, handleError, getAuthedUser, requireAuthed } from "@/lib/api";
import { goalSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { listGoals, createGoal, addMilestone } from "@/lib/goals";

export async function GET(req: Request) {
  try {
    const user = await getAuthedUser();
    if (!user) return error("Unauthorized", 401);

    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? undefined;

    const goals = await listGoals(user.id, status);
    return json({ goals });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const data = goalSchema.parse(await req.json());
    const goal = await createGoal(user.id, data);

    // Initialize standard milestones
    const standardPercentages = [10, 25, 50, 75, 100];
    for (const pct of standardPercentages) {
      await addMilestone(user.id, goal.id, pct, false);
    }

    // Fetch the goal again with milestones populated
    const populatedGoal = await listGoals(user.id, undefined);
    const resultGoal = populatedGoal.find((g) => g.id === goal.id);

    return json({ goal: resultGoal }, 201);
  } catch (e) {
    return handleError(e);
  }
}
