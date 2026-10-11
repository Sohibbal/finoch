import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readdirSync } from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { middleware, config } from "@/middleware";
import { signSessionToken, COOKIE_NAME } from "@/lib/auth/jwt";
import { safeNextPath } from "@/lib/auth/safe-next";

function request(url: string, token?: string) {
  const req = new NextRequest(new URL(url, "http://localhost:3000"));
  if (token) req.cookies.set(COOKIE_NAME, token);
  return req;
}

const validToken = () => signSessionToken({ userId: "u1", email: "a@b.co", name: "A" });

describe("auth middleware", () => {
  beforeEach(() => vi.stubEnv("JWT_SECRET", "test-secret-at-least-32-characters-long"));
  afterEach(() => vi.unstubAllEnvs());

  it("redirects to /login with next when the cookie is missing", async () => {
    const res = await middleware(request("/wallets?tab=bank"));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe("/wallets?tab=bank");
  });

  it("redirects when the JWT fails verification", async () => {
    const res = await middleware(request("/dashboard", "not.a.jwt"));
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });

  it("redirects when JWT_SECRET is missing instead of throwing", async () => {
    const token = await validToken();
    vi.stubEnv("JWT_SECRET", "");
    const res = await middleware(request("/dashboard", token));
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });

  it("passes through with a valid session", async () => {
    const res = await middleware(request("/goals", await validToken()));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("lets guests open /login and /register", async () => {
    for (const p of ["/login", "/register"]) {
      expect((await middleware(request(p))).headers.get("location")).toBeNull();
    }
  });

  it("sends logged-in users from /login to /dashboard, or to a safe next", async () => {
    const token = await validToken();
    const plain = await middleware(request("/register", token));
    expect(new URL(plain.headers.get("location")!).pathname).toBe("/dashboard");

    const withNext = await middleware(request("/login?next=%2Fbudget%3Fm%3D1", token));
    expect(new URL(withNext.headers.get("location")!).href).toBe("http://localhost:3000/budget?m=1");

    const evil = await middleware(request("/login?next=%2F%2Fevil.com", token));
    expect(new URL(evil.headers.get("location")!).href).toBe("http://localhost:3000/dashboard");
  });

  it("matches every page in the (app) route group and onboarding, never /api or /", () => {
    const appDir = path.resolve(__dirname, "../../src/app/(app)");
    const routes = readdirSync(appDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
    expect(routes.length).toBeGreaterThan(0);
    for (const route of [...routes, "onboarding"]) {
      expect(config.matcher).toContain(`/${route}/:path*`);
    }
    expect(config.matcher.some((m) => m.startsWith("/api") || m === "/" || m.startsWith("/_next"))).toBe(false);
  });
});

describe("safeNextPath (open-redirect guard)", () => {
  it.each([
    ["/budget", "/budget"],
    ["/wallets?tab=bank#top", "/wallets?tab=bank#top"],
  ])("keeps relative path %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });

  it.each([
    null,
    undefined,
    "",
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "/.//evil.com",
    "javascript:alert(1)",
    "dashboard",
    "/login",
    "/register?next=/x",
  ])("falls back for %s", (input) => {
    expect(safeNextPath(input)).toBe("/dashboard");
  });
});
