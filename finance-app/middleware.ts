import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

async function verifyJose(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("spfa_session")?.value;
  const valid = token ? await verifyJose(token) : false;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api")) {
    if (pathname === "/api/health" || pathname.startsWith("/api/auth/")) {
      return NextResponse.next();
    }
    if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.next();
  }

  if (!valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/categories/:path*",
    "/budgets/:path*",
    "/insights/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/api/:path*",
  ],
};
