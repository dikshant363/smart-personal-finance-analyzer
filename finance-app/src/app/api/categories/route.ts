import { getAuthedUser, requireAuthed } from "@/lib/api";
import { json, error, handleError } from "@/lib/api";
import { categorySchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getAuthedUser();
    if (!user) return error("Unauthorized", 401);
    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
    return json({ categories });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const data = categorySchema.parse(await req.json());
    const c = await prisma.category.create({
      data: {
        userId: user.id,
        name: data.name,
        type: data.type,
        color: data.color ?? "#6366f1",
        icon: data.icon ?? "tag",
      },
    });
    return json({ category: c }, 201);
  } catch (e) {
    return handleError(e);
  }
}
