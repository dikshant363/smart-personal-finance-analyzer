import { json, error, handleError, requireAuthed } from "@/lib/api";
import { budgetSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { computeBudgetSpent } from "@/lib/budgets";
import { toNumber } from "@/lib/currency";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const budget = await prisma.budget.findUnique({ where: { id: params.id } });
    if (!budget || budget.userId !== user.id) return error("Not found", 404);
    const data = budgetSchema.parse(await req.json());
    const updated = await prisma.budget.update({
      where: { id: params.id },
      data: {
        name: data.name,
        amount: data.amount,
        period: data.period ?? budget.period,
        categoryId: data.categoryId ?? null,
      },
    });
    const spent = await computeBudgetSpent(user.id, updated);
    const amount = toNumber(updated.amount);
    return json({
      ...updated,
      amount,
      spent,
      remaining: amount - spent,
      percent: amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0,
    });
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
    const budget = await prisma.budget.findUnique({ where: { id: params.id } });
    if (!budget || budget.userId !== user.id) return error("Not found", 404);
    await prisma.budget.delete({ where: { id: params.id } });
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
