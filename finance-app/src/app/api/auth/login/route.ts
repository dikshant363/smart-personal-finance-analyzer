import { loginSchema } from "@/lib/validation";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { json, error, handleError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: { email: data.email.toLowerCase(), deletedAt: null },
    });

    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      return error("Invalid email or password", 401);
    }

    await setSessionCookie(user.id, user.email);

    return json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    return handleError(e);
  }
}
