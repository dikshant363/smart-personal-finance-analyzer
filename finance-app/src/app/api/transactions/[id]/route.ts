import { json, error, handleError, requireAuthed } from "@/lib/api";
import { transactionSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const u = await requireAuthed();
    const { id } = params;
    const t = await prisma.transaction.findUnique({ where: { id } });
    if (!t || t.userId !== u.id) return error("Not found", 404);
    const data = transactionSchema.parse(await req.json());
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        type: data.type,
        amount: data.amount,
        currency: data.currency ?? t.currency,
        categoryId: data.categoryId ?? null,
        description: data.description,
        date: data.date ? new Date(data.date) : t.date,
      },
    });
    return json({ transaction: { ...updated, amount: toNumber(updated.amount) } });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const u = await requireAuthed();
    const { id } = params;
    const t = await prisma.transaction.findUnique({ where: { id } });
    if (!t || t.userId !== u.id) return error("Not found", 404);
    await prisma.transaction.delete({ where: { id } });
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
