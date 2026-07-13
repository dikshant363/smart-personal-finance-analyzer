import { json, handleError, requireAuthed } from "@/lib/api";
import { createHousehold } from "@/lib/family";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createHouseholdSchema = z.object({
  name: z.string().min(1),
});

export async function GET() {
  try {
    const user = await requireAuthed();
    const profiles = await prisma.householdProfile.findMany({
      where: { members: { some: { userId: user.id } } },
      include: { members: true },
    });
    return json({ households: profiles }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const { name } = createHouseholdSchema.parse(body);

    const created = await createHousehold(user.id, name);
    return json({ household: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
