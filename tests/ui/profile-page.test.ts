import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

vi.mock("next/navigation", () => ({ usePathname: () => "/profile", useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components/layout/auth-provider", () => ({
  useAuthContext: () => ({ user: { id: "u1", name: "Sari", email: "sari@finoch.id" } }),
}));

describe("Profile Management Page", () => {
  it("exports Profile page component", async () => {
    const mod = await import("@/app/(app)/profile/page");
    expect(mod.default).toBeDefined();
  });

  it("offers the demo mode switch with its explanation", async () => {
    const mod = await import("@/app/(app)/profile/page");
    const html = renderToString(React.createElement(mod.default));
    expect(html).toContain("Mode Demo (data contoh)");
    expect(html).toContain("tidak disinkron");
    expect(html).toContain('role="switch"');
  });
});
