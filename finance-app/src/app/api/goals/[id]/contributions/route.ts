import { json, error, handleError, requireAuthed } from "@/lib/api";
import { addContribution, getGoalContributionHistory } from "@/lib/goals";
import { z } from "zod";

const contributionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().max(200).optional().nullable(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const history = await getGoalContributionHistory(user.id, params.id);
    return json({ history });
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
    const data = contributionSchema.parse(body);

    const contribution = await addContribution(
      user.id,
      params.id,
      data.amount,
      data.description
    );

    return json({ contribution }, 201);
  } catch (e) {
    return handleError(e);
  }
}
