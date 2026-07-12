import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const url = new URL(req.url);
    const format = url.searchParams.get("format") ?? "json";
    const startDateStr = url.searchParams.get("startDate");
    const endDateStr = url.searchParams.get("endDate");
    const categoryId = url.searchParams.get("categoryId");

    const where: any = { userId: user.id };

    if (startDateStr || endDateStr) {
      where.date = {};
      if (startDateStr) where.date.gte = new Date(startDateStr);
      if (endDateStr) where.date.lte = new Date(endDateStr);
    }

    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
    });

    // Write audit log
    await prisma.exchangeAudit.create({
      data: {
        userId: user.id,
        action: "EXPORT",
        format: format.toUpperCase(),
        dataset: "Transactions",
        status: "success",
        recordCount: transactions.length,
      },
    });

    if (format === "csv") {
      const headers = ["Date", "Type", "Amount", "Description", "Category"];
      const rows = transactions.map((t) => [
        new Date(t.date).toISOString().slice(0, 10),
        t.type,
        toNumber(t.amount),
        `"${t.description?.replace(/"/g, '""') || ""}"`,
        t.category?.name || "Uncategorized",
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=transactions_export.csv",
        },
      });
    }

    return json({
      transactions: transactions.map((t) => ({
        id: t.id,
        date: t.date,
        type: t.type,
        amount: toNumber(t.amount),
        description: t.description,
        category: t.category?.name || "Uncategorized",
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}
