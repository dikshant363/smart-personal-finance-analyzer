import { json, error, handleError, getAuthedUser, requireAuthed } from "@/lib/api";
import { budgetSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { computeBudgetSpent } from "@/lib/budgets";
import { toNumber } from "@/lib/currency";

export async function GET() {
  try {
    const user = await getAuthedUser();
    if (!user) return error("Unauthorized", 401);
    const budgets = await prisma.budget.findMany({
      where: { userId: user.id },
      include: { category: { select: { name: true, color: true } } },
    });
    const items = await Promise.all(
      budgets.map(async (b) => {
        const spent = await computeBudgetSpent(user.id, b);
        const amount = toNumber(b.amount);
        return {
          ...b,
          amount,
          spent,
          remaining: amount - spent,
          percent: amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0,
        };
      })
    );
    return json({ budgets: items });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const data = budgetSchema.parse(await req.json());
    const created = await prisma.budget.create({
      data: {
        userId: user.id,
        name: data.name,
        amount: data.amount,
        period: data.period ?? "Monthly",
        categoryId: data.categoryId ?? null,
      },
    });
    return json({ budget: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
