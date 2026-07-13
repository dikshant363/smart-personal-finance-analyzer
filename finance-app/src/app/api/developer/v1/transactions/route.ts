import { json, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuthed();
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
    });
    return json({ transactions }, 200);
  } catch (e) {
    return handleError(e);
  }
}
