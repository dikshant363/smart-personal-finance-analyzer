import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createAssetSchema = z.object({
  name: z.string(),
  type: z.string(),
  currentValue: z.number().nonnegative(),
  purchaseValue: z.number().nonnegative(),
  purchaseDate: z.string(),
  appreciationRate: z.number(),
  currency: z.string().optional(),
  ownership: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    let list = await prisma.asset.findMany({
      where: { userId: user.id, status: "Active" },
      orderBy: { createdAt: "desc" },
    });

    // Seed default demo assets if none exist
    if (list.length === 0) {
      const now = new Date();
      await prisma.asset.createMany({
        data: [
          {
            userId: user.id,
            name: "Primary Checking Account",
            type: "SavingsAccount",
            currentValue: 4000,
            purchaseValue: 4000,
            purchaseDate: now,
            appreciationRate: 1.5,
            ownership: "100",
            status: "Active",
          },
          {
            userId: user.id,
            name: "Retirement Brokerage Mutual Fund",
            type: "MutualFund",
            currentValue: 8500,
            purchaseValue: 7200,
            purchaseDate: new Date(now.getFullYear() - 2, now.getMonth(), 1),
            appreciationRate: 7.2,
            ownership: "100",
            status: "Active",
          },
          {
            userId: user.id,
            name: "Liquid Cash holdings",
            type: "Cash",
            currentValue: 1200,
            purchaseValue: 1200,
            purchaseDate: now,
            appreciationRate: 0.0,
            ownership: "100",
            status: "Active",
          },
        ],
      });

      list = await prisma.asset.findMany({
        where: { userId: user.id, status: "Active" },
        orderBy: { createdAt: "desc" },
      });
    }

    return json({ assets: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = createAssetSchema.parse(body);

    const asset = await prisma.asset.create({
      data: {
        userId: user.id,
        name: data.name,
        type: data.type,
        currentValue: data.currentValue,
        purchaseValue: data.purchaseValue,
        purchaseDate: new Date(data.purchaseDate),
        appreciationRate: data.appreciationRate,
        currency: data.currency ?? "USD",
        ownership: data.ownership ?? "100",
        notes: data.notes ?? null,
        status: "Active",
      },
    });

    return json({ asset }, 201);
  } catch (e) {
    return handleError(e);
  }
}
