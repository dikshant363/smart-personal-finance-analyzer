import { json, handleError, requireAuthed } from "@/lib/api";
import { computeBusinessPL } from "@/lib/business";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    await requireAuthed();
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return json({ error: "businessId is required" }, 400);
    }

    const paidInvoices = await prisma.businessInvoice.findMany({
      where: { businessId, status: "Paid" },
    });

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Mock expenses matching Schedule C categories
    const mockExpenses = [
      { category: "Advertising", amount: 150 },
      { category: "Utilities", amount: 95 },
      { category: "Office Supplies", amount: 45 },
    ];

    const pl = computeBusinessPL(totalRevenue, mockExpenses);
    return json({ pl }, 200);
  } catch (e) {
    return handleError(e);
  }
}
