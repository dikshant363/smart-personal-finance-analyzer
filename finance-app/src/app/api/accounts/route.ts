import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createAccountSchema = z.object({
  name: z.string(),
  institution: z.string(),
  type: z.string(),
  openingBalance: z.number().nonnegative(),
  currentBalance: z.number().nonnegative(),
  portfolioId: z.string().optional(),
  owner: z.string().optional(),
  currency: z.string().optional(),
  metadata: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    let list = await prisma.account.findMany({
      where: { userId: user.id, status: "Active" },
      orderBy: { createdAt: "desc" },
    });

    // Seed default accounts if none exist
    if (list.length === 0) {
      // Find a portfolio of the user to link
      let portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } });
      if (!portfolio) {
        portfolio = await prisma.portfolio.create({
          data: { userId: user.id, name: "Personal Wealth" },
        });
      }

      await prisma.account.createMany({
        data: [
          {
            userId: user.id,
            portfolioId: portfolio.id,
            name: "Chase Checking Account",
            institution: "Chase Bank",
            type: "Checking",
            openingBalance: 4500,
            currentBalance: 4500,
            status: "Active",
            owner: "Self",
          },
          {
            userId: user.id,
            portfolioId: portfolio.id,
            name: "Coinbase Crypto Wallet",
            institution: "Coinbase",
            type: "Crypto",
            openingBalance: 1200,
            currentBalance: 1200,
            status: "Active",
            owner: "Self",
          },
        ],
      });

      list = await prisma.account.findMany({
        where: { userId: user.id, status: "Active" },
        orderBy: { createdAt: "desc" },
      });
    }

    return json({ accounts: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = createAccountSchema.parse(body);

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        portfolioId: data.portfolioId ?? null,
        name: data.name,
        institution: data.institution,
        type: data.type,
        openingBalance: data.openingBalance,
        currentBalance: data.currentBalance,
        currency: data.currency ?? "USD",
        owner: data.owner ?? "Self",
        metadata: data.metadata ?? null,
        status: "Active",
      },
    });

    return json({ account }, 201);
  } catch (e) {
    return handleError(e);
  }
}
