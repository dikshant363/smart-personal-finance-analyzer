import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPortfolioSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    let list = await prisma.portfolio.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    });

    // Seed default portfolios if none exist
    if (list.length === 0) {
      await prisma.portfolio.createMany({
        data: [
          {
            userId: user.id,
            name: "Personal Wealth",
            description: "Main portfolio holding standard savings, checkings, and assets.",
          },
          {
            userId: user.id,
            name: "Retirement Portfolio",
            description: "Long-term investment plans and locked brokerage balances.",
          },
          {
            userId: user.id,
            name: "Business Reserve",
            description: "Margins set aside for startup expenses or venture trials.",
          },
        ],
      });

      list = await prisma.portfolio.findMany({
        where: { userId: user.id },
        orderBy: { name: "asc" },
      });
    }

    return json({ portfolios: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = createPortfolioSchema.parse(body);

    const portfolio = await prisma.portfolio.create({
      data: {
        userId: user.id,
        name: data.name,
        description: data.description ?? null,
      },
    });

    return json({ portfolio }, 201);
  } catch (e) {
    return handleError(e);
  }
}
