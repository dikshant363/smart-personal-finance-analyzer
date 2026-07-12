import { json, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrencyAllocationSummary } from "@/lib/currency/engine";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    const baseCurrency = profile?.currency ?? "USD";

    const allocation = await getCurrencyAllocationSummary(user.id, baseCurrency);

    return json({
      baseCurrency,
      allocation,
    }, 200);
  } catch (e) {
    return handleError(e);
  }
}
