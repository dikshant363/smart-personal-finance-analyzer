import { json, error, handleError, requireAuthed } from "@/lib/api";
import { addMilestone, getGoalMilestones, deleteMilestone } from "@/lib/goals";
import { z } from "zod";

const milestoneSchema = z.object({
  percentage: z.number().int().min(1).max(100),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const milestones = await getGoalMilestones(user.id, params.id);
    return json({ milestones });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = milestoneSchema.parse(body);

    const milestone = await addMilestone(
      user.id,
      params.id,
      data.percentage,
      true
    );

    return json({ milestone }, 201);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const url = new URL(req.url);
    const milestoneId = url.searchParams.get("milestoneId");

    if (!milestoneId) return error("milestoneId is required", 400);

    const ok = await deleteMilestone(user.id, params.id, milestoneId);
    if (!ok) return error("Not found", 404);

    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
