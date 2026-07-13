import { json, handleError, requireAuthed } from "@/lib/api";
import { createBusinessProfile } from "@/lib/business";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProfileSchema = z.object({
  name: z.string().min(1),
  businessType: z.string().min(1),
});

export async function GET() {
  try {
    const user = await requireAuthed();
    const profiles = await prisma.businessProfile.findMany({
      where: { userId: user.id },
    });
    return json({ profiles }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const { name, businessType } = createProfileSchema.parse(body);

    const created = await createBusinessProfile(user.id, name, businessType);
    return json({ profile: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
