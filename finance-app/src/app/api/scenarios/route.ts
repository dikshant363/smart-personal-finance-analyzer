import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createScenarioSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
  startDate: z.string(),
  durationMonths: z.number().int().positive(),
  priority: z.enum(["high", "medium", "low"]),
  estimatedCost: z.number().nonnegative(),
  expectedIncomeImpact: z.number(),
  expectedExpenseImpact: z.number().nonnegative(),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    let list = await prisma.financialScenario.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Auto seed 3 default scenarios for demo comparisons if empty
    if (list.length === 0) {
      const now = new Date();
      await prisma.financialScenario.createMany({
        data: [
          {
            userId: user.id,
            name: "Immediate House Purchase (A)",
            type: "BuyHouse",
            description: "Simulating buying a starter home immediately using savings.",
            startDate: now,
            durationMonths: 24,
            priority: "high",
            estimatedCost: 15000,
            expectedIncomeImpact: 0,
            expectedExpenseImpact: 1200,
            status: "Planned",
          },
          {
            userId: user.id,
            name: "Delayed House Purchase (B)",
            type: "BuyHouse",
            description: "Wait 2 years, accumulate more surplus capital before buying.",
            startDate: new Date(now.getFullYear() + 2, now.getMonth(), 1),
            durationMonths: 24,
            priority: "high",
            estimatedCost: 8000,
            expectedIncomeImpact: 0,
            expectedExpenseImpact: 900,
            status: "Draft",
          },
          {
            userId: user.id,
            name: "Early Retirement Track",
            type: "Retirement",
            description: "Increase retirement contributions aggressively by $500 monthly.",
            startDate: now,
            durationMonths: 60,
            priority: "medium",
            estimatedCost: 0,
            expectedIncomeImpact: 0,
            expectedExpenseImpact: 500,
            status: "Active",
          },
        ],
      });

      list = await prisma.financialScenario.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
    }

    return json({ scenarios: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = createScenarioSchema.parse(body);

    const scenario = await prisma.financialScenario.create({
      data: {
        userId: user.id,
        name: data.name,
        type: data.type,
        description: data.description ?? null,
        startDate: new Date(data.startDate),
        durationMonths: data.durationMonths,
        priority: data.priority,
        estimatedCost: data.estimatedCost,
        expectedIncomeImpact: data.expectedIncomeImpact,
        expectedExpenseImpact: data.expectedExpenseImpact,
        status: "Planned",
      },
    });

    return json({ scenario }, 201);
  } catch (e) {
    return handleError(e);
  }
}
