import { json, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuthed();
    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
    });
    return json({ accounts }, 200);
  } catch (e) {
    return handleError(e);
  }
}
