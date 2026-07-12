import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const existing = await prisma.financialScenario.findUnique({ where: { id: params.id } });
    if (!existing || existing.userId !== user.id) {
      return error("Scenario not found", 404);
    }

    await prisma.financialScenario.delete({ where: { id: params.id } });
    return json({ ok: true }, 200);
  } catch (e) {
    return handleError(e);
  }
}
