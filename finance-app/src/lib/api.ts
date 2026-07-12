import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "@/lib/auth";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function json(data: unknown, init?: ResponseInit | number): NextResponse {
  const responseInit: ResponseInit | undefined =
    typeof init === "number" ? { status: init } : init;
  return NextResponse.json(data, responseInit);
}

export function error(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function getAuthedUser(): Promise<SessionUser | null> {
  return await getCurrentUser();
}

export async function requireAuthed(): Promise<SessionUser> {
  const user = await getAuthedUser();
  if (!user) throw new ApiError("Unauthorized", 401);
  return user;
}

export function handleError(e: unknown): NextResponse {
  if (e instanceof ApiError) {
    return error(e.message, e.status);
  }
  console.error(e);
  return error("Internal server error", 500);
}
