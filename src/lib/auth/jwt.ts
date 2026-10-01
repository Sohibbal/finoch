import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "../types/auth";

export const COOKIE_NAME = "voicash_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "voicash-super-secure-stateless-jwt-secret-minimum-32-characters"
);

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (!payload.userId || !payload.email) {
      return null;
    }
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: (payload.name as string) || "",
    };
  } catch {
    return null;
  }
}

export function parseCookieHeader(cookieHeader?: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  const items = cookieHeader.split(";");
  for (const item of items) {
    const [key, ...vals] = item.trim().split("=");
    if (key) {
      cookies[key] = decodeURIComponent(vals.join("="));
    }
  }
  return cookies;
}

export async function getSessionFromRequest(req: Request): Promise<SessionPayload | null> {
  const cookieHeader = req.headers.get("cookie");
  const cookies = parseCookieHeader(cookieHeader);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifySessionToken(token);
}

export function getCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  };
}
