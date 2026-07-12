import { json, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validation";

export async function PUT(req: Request) {
  try {
    const authed = await requireAuthed();
    const parsed = settingsSchema.parse(await req.json());
    const data = Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => v !== undefined)
    );

    const settings = await prisma.userSettings.upsert({
      where: { userId: authed.id },
      create: { userId: authed.id, ...data },
      update: data,
    });

    return json({ settings });
  } catch (e) {
    return handleError(e);
  }
}
