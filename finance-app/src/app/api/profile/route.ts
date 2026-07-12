import { json, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authed = await requireAuthed();
    const [user, profile, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: authed.id },
        select: { id: true, email: true, name: true },
      }),
      prisma.profile.findUnique({ where: { userId: authed.id } }),
      prisma.userSettings.findUnique({ where: { userId: authed.id } }),
    ]);
    return json({ user, profile, settings });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: Request) {
  try {
    const authed = await requireAuthed();
    const body = (await req.json()) as {
      name?: string;
      currency?: string;
      timezone?: string;
      locale?: string;
      bio?: string;
      avatarUrl?: string;
    };

    if (body.name !== undefined) {
      await prisma.user.update({
        where: { id: authed.id },
        data: { name: body.name },
      });
    }

    const profileData = Object.fromEntries(
      Object.entries({
        currency: body.currency,
        timezone: body.timezone,
        locale: body.locale,
        bio: body.bio,
        avatarUrl: body.avatarUrl,
      }).filter(([, v]) => v !== undefined)
    );

    const profile = await prisma.profile.upsert({
      where: { userId: authed.id },
      create: { userId: authed.id, ...profileData },
      update: profileData,
    });

    const user = await prisma.user.findUnique({
      where: { id: authed.id },
      select: { id: true, email: true, name: true },
    });

    return json({ user, profile });
  } catch (e) {
    return handleError(e);
  }
}
