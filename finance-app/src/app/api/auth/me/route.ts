import { getCurrentUser } from "@/lib/auth";
import { json, error, handleError } from "@/lib/api";

export async function GET() {
  try {
    const u = await getCurrentUser();
    if (!u) return error("Unauthorized", 401);
    return json({ user: u });
  } catch (e) {
    return handleError(e);
  }
}
