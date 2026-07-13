import { json, error, handleError, getAuthedUser, requireAuthed } from "@/lib/api";
import { transactionSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";
import { withBaseCurrency } from "@/lib/currency";
import { publishEvent } from "@/lib/automation";

export async function GET(req: Request) {
  try {
    const u = await getAuthedUser();
    if (!u) return error("Unauthorized", 401);
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const categoryId = url.searchParams.get("categoryId");
    const month = url.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);

    const where: Record<string, unknown> = { userId: u.id };
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (month) {
      const [y, m] = month.split("-").map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 1);
      (where as { date?: { gte: Date; lt: Date } }).date = { gte: start, lt: end };
    }

    const txs = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      take: 200,
      include: { category: { select: { name: true, color: true } } },
    });

    const profile = await prisma.profile.findUnique({ where: { userId: u.id } });
    const baseCurrency = profile?.currency ?? "USD";

    const mapped = txs.map((t) => ({
      ...t,
      amount: toNumber(t.amount),
      date: t.date.toISOString(),
    }));
    const transactions = await withBaseCurrency(mapped, baseCurrency);
    return json({ transactions });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const u = await requireAuthed();
    const data = transactionSchema.parse(await req.json());
    const t = await prisma.transaction.create({
      data: {
        userId: u.id,
        type: data.type,
        amount: data.amount,
        currency: data.currency ?? "USD",
        categoryId: data.categoryId ?? null,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
        source: "Manual",
      },
    });

    await publishEvent({
      type: "transaction.created",
      userId: u.id,
      payload: t,
    });

    return json({ transaction: { ...t, amount: toNumber(t.amount) } }, 201);
  } catch (e) {
    return handleError(e);
  }
}
