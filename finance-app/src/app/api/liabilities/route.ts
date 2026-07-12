import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createLiabilitySchema = z.object({
  name: z.string(),
  type: z.string(),
  originalAmount: z.number().nonnegative(),
  outstandingBalance: z.number().nonnegative(),
  interestRate: z.number(),
  lender: z.string(),
  emiAmount: z.number().nonnegative(),
  repaymentFrequency: z.string().optional(),
  nextDueDate: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    let list = await prisma.liability.findMany({
      where: { userId: user.id, status: "Active" },
      orderBy: { createdAt: "desc" },
    });

    // Seed default demo liabilities if none exist
    if (list.length === 0) {
      const now = new Date();
      await prisma.liability.createMany({
        data: [
          {
            userId: user.id,
            name: "Student Education Loan",
            type: "EducationLoan",
            originalAmount: 20000,
            outstandingBalance: 15000,
            interestRate: 4.5,
            lender: "Federal Loan Corp",
            emiAmount: 250,
            repaymentFrequency: "Monthly",
            nextDueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
            startDate: new Date(now.getFullYear() - 3, now.getMonth(), 1),
            endDate: new Date(now.getFullYear() + 5, now.getMonth(), 1),
            status: "Active",
          },
          {
            userId: user.id,
            name: "Visa Premium Credit Card",
            type: "CreditCard",
            originalAmount: 5000,
            outstandingBalance: 3200,
            interestRate: 18.0,
            lender: "National Bank",
            emiAmount: 120,
            repaymentFrequency: "Monthly",
            nextDueDate: new Date(now.getFullYear(), now.getMonth() + 1, 10),
            startDate: new Date(now.getFullYear() - 1, now.getMonth(), 1),
            endDate: new Date(now.getFullYear() + 2, now.getMonth(), 1),
            status: "Active",
          },
        ],
      });

      list = await prisma.liability.findMany({
        where: { userId: user.id, status: "Active" },
        orderBy: { createdAt: "desc" },
      });
    }

    return json({ liabilities: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = createLiabilitySchema.parse(body);

    const liability = await prisma.liability.create({
      data: {
        userId: user.id,
        name: data.name,
        type: data.type,
        originalAmount: data.originalAmount,
        outstandingBalance: data.outstandingBalance,
        interestRate: data.interestRate,
        lender: data.lender,
        emiAmount: data.emiAmount,
        repaymentFrequency: data.repaymentFrequency ?? "Monthly",
        nextDueDate: new Date(data.nextDueDate),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        notes: data.notes ?? null,
        status: "Active",
      },
    });

    return json({ liability }, 201);
  } catch (e) {
    return handleError(e);
  }
}
