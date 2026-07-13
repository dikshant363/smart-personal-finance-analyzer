import { json, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createWorkflowSchema = z.object({
  name: z.string().min(1),
  triggerType: z.string().min(1),
  conditions: z.array(
    z.object({
      field: z.string(),
      operator: z.enum(["equals", "greater_than", "less_than"]),
      value: z.any(),
    })
  ),
  actions: z.array(
    z.object({
      type: z.enum(["send_notification", "create_reminder", "create_timeline"]),
      params: z.any(),
    })
  ),
});

export async function GET() {
  try {
    const user = await requireAuthed();
    const workflows = await prisma.automationWorkflow.findMany({
      where: { userId: user.id },
    });
    return json({ workflows }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const parsed = createWorkflowSchema.parse(body);

    const created = await prisma.automationWorkflow.create({
      data: {
        userId: user.id,
        name: parsed.name,
        triggerType: parsed.triggerType,
        conditions: JSON.stringify(parsed.conditions),
        actions: JSON.stringify(parsed.actions),
      },
    });

    return json({ workflow: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
