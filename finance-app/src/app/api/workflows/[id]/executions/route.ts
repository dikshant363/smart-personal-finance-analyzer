import { json, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    await requireAuthed();
    const { id } = await context.params;

    const executions = await prisma.workflowExecution.findMany({
      where: { workflowId: id },
      orderBy: { createdAt: "desc" },
    });

    return json({ executions }, 200);
  } catch (e) {
    return handleError(e);
  }
}
