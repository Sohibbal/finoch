import { describe, it, expect, vi } from "vitest";

const mocks = vi.hoisted(() => ({ session: vi.fn(), findUnique: vi.fn() }));
vi.mock("@/lib/auth/jwt", () => ({ getSessionFromRequest: mocks.session }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique: mocks.findUnique } } }));

describe("GET /api/auth/me", () => {
  it("answers 503 (not user:null) when the database is down, so clients don't log out", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.session.mockResolvedValue({ userId: "u1", email: "a@b.id" });
    mocks.findUnique.mockRejectedValue(new Error("db down"));
    const { GET } = await import("@/app/api/auth/me/route");
    expect((await GET(new Request("http://localhost/api/auth/me"))).status).toBe(503);
  });

  it("still answers user:null for a missing session", async () => {
    mocks.session.mockResolvedValue(null);
    const { GET } = await import("@/app/api/auth/me/route");
    const res = await GET(new Request("http://localhost/api/auth/me"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ user: null });
  });
});
