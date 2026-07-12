import { requireAuthed, error, json, handleError } from "@/lib/api";
import { categorySchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const { id } = params;
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat || cat.userId !== user.id) return error("Not found", 404);
    const data = categorySchema.parse(await req.json());
    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: data.name ?? cat.name,
        type: data.type ?? cat.type,
        color: data.color ?? cat.color,
        icon: data.icon ?? cat.icon,
      },
    });
    return json({ category: updated });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const { id } = params;
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat || cat.userId !== user.id) return error("Not found", 404);
    await prisma.category.delete({ where: { id } });
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
