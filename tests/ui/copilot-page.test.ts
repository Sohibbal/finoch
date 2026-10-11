import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

vi.mock("next/navigation", () => ({
  usePathname: () => "/copilot",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("Copilot Page Component", () => {
  it("exports Copilot page component successfully", async () => {
    const mod = await import("@/app/(app)/copilot/page");
    expect(mod.default).toBeDefined();
  });

  it("greets in the FinBot Gen-Z voice", async () => {
    const mod = await import("@/app/(app)/copilot/page");
    const html = renderToString(React.createElement(mod.default));
    expect(html).toContain("FinBot");
    expect(html).toContain("Gue FinBot");
    expect(html).toContain("database lo");
  });

  it("provides quick prompt suggestions for the user", async () => {
    const mod = await import("@/app/(app)/copilot/page");
    const html = renderToString(React.createElement(mod.default));
    expect(html).toContain("Bulan ini gue paling boros apa?");
    expect(html).toContain("Sisa uang jajan gue masih aman gak?");
    expect(html).toContain("Kapan wishlist gue bisa kebeli?");
  });
});
