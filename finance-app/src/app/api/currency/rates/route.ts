import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { addExchangeRateSnapshot } from "@/lib/currency/engine";
import { z } from "zod";

const createRateSchema = z.object({
  fromCurrency: z.string().length(3),
  toCurrency: z.string().length(3),
  rate: z.number().positive(),
});

export async function GET(req: Request) {
  try {
    await requireAuthed();

    let list = await prisma.exchangeRate.findMany({
      orderBy: { date: "desc" },
      take: 20,
    });

    // Seed default rates if empty
    if (list.length === 0) {
      await Promise.all([
        addExchangeRateSnapshot("EUR", "USD", 1.08),
        addExchangeRateSnapshot("GBP", "USD", 1.27),
        addExchangeRateSnapshot("INR", "USD", 0.012),
      ]);

      list = await prisma.exchangeRate.findMany({
        orderBy: { date: "desc" },
        take: 20,
      });
    }

    return json({ rates: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAuthed();
    const body = await req.json();
    const data = createRateSchema.parse(body);

    const snapshot = await addExchangeRateSnapshot(
      data.fromCurrency.toUpperCase(),
      data.toCurrency.toUpperCase(),
      data.rate
    );

    return json({ snapshot }, 201);
  } catch (e) {
    return handleError(e);
  }
}
