import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";
import { z } from "zod";

const confirmImportSchema = z.object({
  items: z.array(
    z.object({
      type: z.enum(["Income", "Expense"]),
      amount: z.number().positive(),
      description: z.string(),
      date: z.string(),
      categoryName: z.string().optional(),
      isDuplicate: z.boolean().optional(),
      isProbableDuplicate: z.boolean().optional(),
    })
  ),
  mergeOption: z.enum(["skip", "merge"]),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const { items, mergeOption } = confirmImportSchema.parse(body);

    let importCount = 0;

    // Resolve categories
    const categories = await prisma.category.findMany({ where: { userId: user.id } });
    const categoryCache: Record<string, string> = {};
    categories.forEach((c) => {
      categoryCache[c.name.toLowerCase()] = c.id;
    });

    for (const item of items) {
      // If skip option, skip exact duplicates
      if (mergeOption === "skip" && (item.isDuplicate || item.isProbableDuplicate)) {
        continue;
      }

      // Check categoryName and cache it
      let categoryId = null;
      if (item.categoryName) {
        const key = item.categoryName.toLowerCase();
        if (categoryCache[key]) {
          categoryId = categoryCache[key];
        } else {
          // Auto create missing category
          const newCat = await prisma.category.create({
            data: {
              userId: user.id,
              name: item.categoryName,
              type: item.type,
              color: "#6366f1", // Default indigo theme color
            },
          });
          categoryCache[key] = newCat.id;
          categoryId = newCat.id;
        }
      }

      // Create transaction
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: item.type,
          amount: toNumber(item.amount),
          currency: "USD",
          description: item.description,
          date: new Date(item.date),
          categoryId,
          source: "Import",
        },
      });

      importCount++;
    }

    // Write audit log
    await prisma.exchangeAudit.create({
      data: {
        userId: user.id,
        action: "IMPORT",
        format: "FILE",
        dataset: "Transactions",
        status: "success",
        recordCount: importCount,
      },
    });

    return json({ importedCount: importCount }, 201);
  } catch (e) {
    return handleError(e);
  }
}
