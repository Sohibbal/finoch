// tests/api/auth-jwt.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { signSessionToken, verifySessionToken } from "@/lib/auth/jwt";

describe("Auth JWT Service", () => {
  beforeEach(() => vi.stubEnv("JWT_SECRET", "test-secret-at-least-32-characters-long"));
  afterEach(() => vi.unstubAllEnvs());
  it.each([undefined, "short"])("rejects missing or short secret: %s", async (secret) => {
    vi.stubEnv("JWT_SECRET", secret);
    await expect(signSessionToken({ userId: "1", email: "a@b.co", name: "A" })).rejects.toThrow("JWT_SECRET");
    await expect(verifySessionToken("invalid")).rejects.toThrow("JWT_SECRET");
  });
  it("signs and verifies session token correctly", async () => {
    const payload = { userId: "user-1", email: "student@kampus.id", name: "Budi" };
    const token = await signSessionToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe("user-1");
    expect(verified?.email).toBe("student@kampus.id");
    expect(verified?.name).toBe("Budi");
  });

  it("returns null for invalid or tampered token", async () => {
    const verified = await verifySessionToken("invalid.token.here");
    expect(verified).toBeNull();
  });
});
