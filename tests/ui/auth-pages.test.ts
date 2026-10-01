// tests/ui/auth-pages.test.ts
import { describe, it, expect } from "vitest";

describe("Auth UI Screens", () => {
  it("exports Login page component", async () => {
    const login = await import("@/app/login/page");
    expect(login.default).toBeDefined();
  });

  it("exports Register page component", async () => {
    const register = await import("@/app/register/page");
    expect(register.default).toBeDefined();
  });

  it("exports useAuth hook", async () => {
    const authHook = await import("@/hooks/use-auth");
    expect(authHook.useAuth).toBeDefined();
  });
});
