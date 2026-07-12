import { signupSchema } from "@/lib/validation";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { json, error, handleError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = signupSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) return error("Email already registered", 409);

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name ?? null,
        profile: { create: { currency: "USD" } },
        settings: { create: {} },
        categories: {
          create: [
            { name: "Salary", type: "Income", color: "#10b981", icon: "banknote" },
            { name: "Groceries", type: "Expense", color: "#f59e0b", icon: "shopping-cart" },
            { name: "Rent", type: "Expense", color: "#6366f1", icon: "home" },
            { name: "Food", type: "Expense", color: "#ef4444", icon: "utensils" },
            { name: "Transport", type: "Expense", color: "#0ea5e9", icon: "bus" },
            { name: "Entertainment", type: "Expense", color: "#a855f7", icon: "clapperboard" },
            { name: "Utilities", type: "Expense", color: "#14b8a6", icon: "zap" },
          ],
        },
      },
    });

    await setSessionCookie(user.id, user.email);

    return json(
      { user: { id: user.id, email: user.email, name: user.name } },
      201
    );
  } catch (e) {
    return handleError(e);
  }
}
