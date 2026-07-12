import { clearSessionCookie } from "@/lib/auth";
import { json, handleError } from "@/lib/api";

export async function POST() {
  try {
    clearSessionCookie();
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
