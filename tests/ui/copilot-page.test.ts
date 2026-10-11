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

  it("greets in the kamu voice, not as a product announcement", async () => {
    const mod = await import("@/app/(app)/copilot/page");
    const html = renderToString(React.createElement(mod.default));
    expect(html).toContain("Hai, aku Finoch.");
    expect(html).toContain("finoch");
    expect(html).not.toContain("voicash.id");
    expect(html).not.toContain("Finoch AI Copilot untuk");
  });

  it("fills the empty chat with the questions as printed slips", async () => {
    const mod = await import("@/app/(app)/copilot/page");
    const html = renderToString(React.createElement(mod.default));
    expect(html).toContain("Jatah jajan hari ini masih aman nggak?");
    expect(html).toContain("Gimana trik hemat makan biar uang kiriman cukup sebulan?");
    expect(html).toContain("Aman nggak kalau beli sepatu/baju baru minggu ini?");
    expect(html).toContain("Kiat bertahan hidup saat krisis tanggal tua");
    expect(html).toContain("Coba tanya ini");
    // Only one set of prompts before the first question: the slips, not the bottom chip row too.
    expect(html).not.toContain("Sering ditanya");
  });
});

