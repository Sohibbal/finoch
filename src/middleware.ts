import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth/jwt";
import { safeNextPath } from "@/lib/auth/safe-next";

const AUTH_PAGES = ["/login", "/register"];

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    return (await verifySessionToken(token)) !== null;
  } catch {
    // Missing JWT_SECRET: no session can be trusted.
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search, searchParams } = req.nextUrl;
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isLoggedIn = await hasValidSession(req);

  if (isAuthPage) {
    if (!isLoggedIn) return NextResponse.next();
    return NextResponse.redirect(new URL(safeNextPath(searchParams.get("next")), req.url));
  }
  if (isLoggedIn) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
}

// Every page under src/app/(app) plus onboarding (it saves the profile, so it needs a user).
export const config = {
  matcher: [
    "/copilot/:path*",
    "/dashboard/:path*",
    "/pemasukan/:path*",
    "/pengeluaran/:path*",
    "/profile/:path*",
    "/wishlist/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
  ],
};
